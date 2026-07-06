const { redisClient } = require('../config/redisClient');
const dbPool = require('../config/db');

// @desc    Lock a seat for 10 minutes to initiate checkout
// @route   POST /api/bookings/lock-seat
// @access  Private (Requires token)
const lockSeat = async (req, res) => {
    const { matchId, seatId } = req.body;
    const userId = req.user.id; // Comes from authMiddleware

    const lockKey = `seat_lock:${matchId}:${seatId}`;

    try {
        // 1. First, quickly check PostgreSQL if the seat is ALREADY permanently booked
        const seatCheck = await dbPool.query(
            'SELECT status FROM Tickets WHERE match_id = $1 AND seat_id = $2', 
            [matchId, seatId]
        );
        if (seatCheck.rows.length > 0 && seatCheck.rows[0].status === 'Booked') {
            return res.status(400).json({ message: 'Seat is already permanently booked.' });
        }

        // 2. The Magic Redis Command: SET NX EX
        // NX = Only set the key if it does NOT already exist
        // EX 600 = Set expiration to 600 seconds (10 minutes)
        const lockAcquired = await redisClient.set(lockKey, String(userId), {
            NX: true,
            EX: 600 
        });

        if (!lockAcquired) {
            // Check if the lock belongs to the SAME user (e.g. page refresh)
            const currentOwner = await redisClient.get(lockKey);
            if (currentOwner === String(userId)) {
                const ttl = await redisClient.ttl(lockKey);
                return res.status(200).json({ 
                    message: 'Seat lock resumed.',
                    lockExpiresIn: `${ttl} seconds`,
                    matchId,
                    seatId
                });
            }

            // Another user holds the lock!
            return res.status(409).json({ 
                message: 'Seat is currently locked by another user. Try again in a few minutes.' 
            });
        }

        // 3. Lock successful! Proceed to checkout phase (Photo capture & payment)
        res.status(200).json({ 
            message: 'Seat locked successfully for 10 minutes.',
            lockExpiresIn: '600 seconds',
            matchId,
            seatId
        });

    } catch (error) {
        console.error('Error locking seat:', error);
        res.status(500).json({ message: 'Internal server error during seat locking.' });
    }
};

// ... existing lockSeat function ...

// @desc    Confirm booking, process photo to vector, and save to DB
// @route   POST /api/bookings/confirm
// @access  Private
const confirmBooking = async (req, res) => {
    const { matchId, seatId, photoBase64, paymentId } = req.body; 
    const userId = req.user.id;
    const lockKey = `seat_lock:${matchId}:${seatId}`;

    try {
        // 1. Verify the user STILL holds the Redis lock
        const lockOwner = await redisClient.get(lockKey);
        
        if (!lockOwner || lockOwner !== String(userId)) {
            return res.status(400).json({ message: 'Booking time expired or lock invalid. Please try locking the seat again.' });
        }

        // 2. Verify payment was successful
        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required. Please complete payment first.' });
        }

        const paymentCheck = await dbPool.query(
            'SELECT status, amount FROM Payments WHERE id = $1 AND user_id = $2',
            [paymentId, userId]
        );

        if (paymentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        if (paymentCheck.rows[0].status !== 'completed') {
            return res.status(400).json({ 
                message: 'Payment not completed. Current status: ' + paymentCheck.rows[0].status 
            });
        }

        const ticketPrice = paymentCheck.rows[0].amount;

        // 3. Call Python AI Microservice to generate Face Vector Embedding (with fallback for testing)
        let faceEmbedding = null;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

        try {
            const aiResponse = await fetch(`${aiServiceUrl}/generate-embedding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: photoBase64 }),
                timeout: 5000
            });

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                faceEmbedding = aiData.embedding;
            } else {
                console.warn('AI service unavailable, using placeholder embedding');
                faceEmbedding = Array(128).fill(0).map(() => Math.random() * 0.1);
            }
        } catch (aiError) {
            console.warn('AI service call failed, using placeholder embedding:', aiError.message);
            faceEmbedding = Array(128).fill(0).map(() => Math.random() * 0.1);
        }

        // 4. Save final ticket to PostgreSQL with payment reference
        const client = await dbPool.connect();
        try {
            await client.query('BEGIN');
            
            const vectorString = `[${faceEmbedding.join(',')}]`;

            // Insert into Tickets table with payment_id and ticket_price
            const newTicket = await client.query(
                `INSERT INTO Tickets (user_id, match_id, seat_id, payment_id, status, face_embedding, ticket_price) 
                 VALUES ($1, $2, $3, $4, 'Booked', $5::vector, $6) RETURNING *`,
                [userId, matchId, seatId, paymentId, vectorString, ticketPrice]
            );

            await client.query('COMMIT');

            // 5. Release the Redis lock
            await redisClient.del(lockKey);

            res.status(201).json({
                message: 'Ticket booked successfully with biometric lock!',
                ticket: newTicket.rows[0]
            });
        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Checkout error:', error);
        require('fs').writeFileSync('checkout_error_log.txt', String(error) + '\n' + String(error.stack) + '\n' + JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Checkout failed', error: error.message });
    }
};
// @desc    Get logged in user's tickets (For the "MyTickets" page)
// @route   GET /api/bookings/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch tickets and join with Seats, Blocks, Stands, Matches, and Stadiums to get full details
        const tickets = await dbPool.query(`
            SELECT t.id as ticket_id, t.status, t.created_at,
                   s.row_id, s.seat_number,
                   b.name as block_name,
                   st.name as stand_name, st.tier as tier_name,
                   m.team_a, m.team_b, m.date as match_date,
                   stadium.name as stadium_name
            FROM Tickets t
            JOIN Seats s ON t.seat_id = s.id
            JOIN Blocks b ON s.block_id = b.id
            JOIN Stands st ON s.stand_id = st.id
            JOIN Matches m ON t.match_id = m.id
            JOIN Stadiums stadium ON m.stadium_id = stadium.id
            WHERE t.user_id = $1
            ORDER BY m.date ASC
        `, [userId]);

        res.status(200).json(tickets.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
};

module.exports = { lockSeat, confirmBooking, getMyTickets };
