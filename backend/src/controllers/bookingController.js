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
    // We no longer strictly need tierName for the DB, but can keep it in payload if frontend sends it.
    const { matchId, seatId, photoBase64 } = req.body; 
    const userId = req.user.id;
    const lockKey = `seat_lock:${matchId}:${seatId}`;

    try {
        // 1. Verify the user STILL holds the Redis lock
        const lockOwner = await redisClient.get(lockKey);
        
        if (!lockOwner || lockOwner !== String(userId)) {
            return res.status(400).json({ message: 'Booking time expired or lock invalid. Please try locking the seat again.' });
        }

        // 2. Call Python AI Microservice to generate Face Vector Embedding
        const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/generate-embedding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: photoBase64 })
        });

        if (!aiResponse.ok) {
            throw new Error('Failed to generate biometric embedding from AI service.');
        }

        const aiData = await aiResponse.json();
        const faceEmbedding = aiData.embedding;

        // 3. Save final ticket to PostgreSQL 
        const client = await dbPool.connect();
        try {
            await client.query('BEGIN');
            
            const vectorString = `[${faceEmbedding.join(',')}]`;

            // NEW: Insert into physical Tickets table which just links match_id and seat_id
            const newTicket = await client.query(
                `INSERT INTO Tickets (user_id, match_id, seat_id, status, face_embedding) 
                 VALUES ($1, $2, $3, 'Booked', $4) RETURNING *`,
                [userId, matchId, seatId, vectorString]
            );

            await client.query('COMMIT');

            // 4. Release the Redis lock early
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

// Don't forget to export it!
module.exports = { lockSeat, confirmBooking, getMyTickets };
