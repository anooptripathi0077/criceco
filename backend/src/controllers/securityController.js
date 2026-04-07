const dbPool = require('../config/db');

// @desc    Fetch ticket details and biometric vector for gate security
// @route   GET /api/security/ticket/:ticketId
// @access  Private (Security Role)
const getTicketForVerification = async (req, res) => {
    const { ticketId } = req.params;

    // Fast-fail if the ID is not a number to prevent SQL type errors
    if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid Ticket ID format.' });
    }

    try {
        const ticket = await dbPool.query(`
            SELECT t.id, t.seat_id, t.status, t.face_embedding::text, 
                   u.name as user_name
            FROM Tickets t
            JOIN Users u ON t.user_id = u.id
            -- Perform a strict integer lookup on both Serial ID and Physical Seat ID
            WHERE t.id = $1::int OR t.seat_id = $1::int
        `, [ticketId]);

        if (ticket.rows.length === 0) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        // Return the ticket info and the 128-dimensional array for the AI service
        res.status(200).json(ticket.rows[0]);
    } catch (error) {
        console.error("Security Lookup Error:", error);
        res.status(500).json({ message: 'Error retrieving ticket', error: error.message });
    }
};

module.exports = { getTicketForVerification };