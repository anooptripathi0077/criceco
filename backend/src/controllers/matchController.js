const dbPool = require('../config/db');

// @desc    Get all upcoming matches
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res) => {
    try {
        const matches = await dbPool.query('SELECT * FROM Matches ORDER BY date ASC');
        res.status(200).json(matches.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch matches', error: error.message });
    }
};

// @desc    Add a new match WITH tiered pricing (Admin Only)
// @route   POST /api/matches
// @access  Private/Admin
const addMatch = async (req, res) => {
    // pricing_tiers should be an array like: [{ stand_id: 'vip_p', base_price: 5000 }, { stand_id: 'm1', base_price: 1000 }]
    const { team_a, team_b, stadium_id, date, pricing_tiers } = req.body;

    const client = await dbPool.connect();

    try {
        await client.query('BEGIN'); // Start transaction for safety

        // 1. Create the Match
        const matchResult = await client.query(
            'INSERT INTO Matches (team_a, team_b, stadium_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [team_a, team_b, stadium_id, date]
        );
        const newMatch = matchResult.rows[0];

        // 2. Add the Pricing Engine logic to Match_Stands_Config
        if (pricing_tiers && pricing_tiers.length > 0) {
            for (let tier of pricing_tiers) {
                await client.query(
                    'INSERT INTO Match_Stands_Config (match_id, stand_id, base_price) VALUES ($1, $2, $3)',
                    [newMatch.id, tier.stand_id, tier.base_price]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Match and pricing created successfully!', match: newMatch });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Failed to create match', error: error.message });
    } finally {
        client.release();
    }
};

// @desc    Get booked seats for a specific match overall
// @route   GET /api/matches/:id/seats
// @access  Public
const getMatchSeatsAndPricing = async (req, res) => {
    const { id } = req.params;

    try {
        // Just return the booked seats to make old UI somewhat functional if needed
        const bookedSeats = await dbPool.query('SELECT seat_id FROM Tickets WHERE match_id = $1 AND status IN ($2, $3, $4)', [id, 'Booked', 'Locked', 'verified']);

        res.status(200).json({
            pricing: [],
            booked_seats: bookedSeats.rows.map(row => row.seat_id) 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch seat data', error: error.message });
    }
};

// @desc    Get physical seats (grid) for a specific match and block
// @route   GET /api/matches/:id/blocks/:blockId/seats
// @access  Public
const getBlockSeats = async (req, res) => {
    const { id, blockId } = req.params;

    try {
        const seatsResult = await dbPool.query(`
            SELECT seat_id, row_id, seat_number, current_price, seat_status
            FROM Match_Seat_Map
            WHERE match_id = $1 AND block_id = $2
            ORDER BY row_id ASC, seat_number ASC
        `, [id, blockId]);

        res.status(200).json(seatsResult.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch block seats', error: error.message });
    }
};

// @desc    Get blocks for a specific stand in a match
// @route   GET /api/matches/:id/stands/:standId/blocks
// @access  Public
const getStandBlocks = async (req, res) => {
    const { id, standId } = req.params;

    try {
        // This query fetches blocks and calculates availability counts scaled to real-world capacity
        const blocksResult = await dbPool.query(`
            SELECT 
                b.id, 
                b.name, 
                COUNT(s.seat_id) as total_rep_seats,
                COUNT(s.seat_id) FILTER (WHERE s.seat_status = 'Available') as available_rep_seats,
                st.capacity,
                st.tier,
                st.category
            FROM Blocks b
            JOIN Match_Seat_Map s ON s.block_id = b.id
            JOIN Stands st ON st.id = b.stand_id
            WHERE s.match_id = $1 AND b.stand_id = $2
            GROUP BY b.id, b.name, st.capacity, st.tier, st.category
            ORDER BY b.name ASC
        `, [id, standId]);

        // Scale the results to show real-world capacity (total / 8)
        const scaledBlocks = blocksResult.rows.map(block => {
            const realWorldTotalPerBlock = Math.round(block.capacity / 8);
            const availabilityRatio = block.total_rep_seats > 0 ? (block.available_rep_seats / block.total_rep_seats) : 0;
            return {
                id: block.id,
                name: block.name,
                total_seats: realWorldTotalPerBlock,
                available_seats: Math.round(realWorldTotalPerBlock * availabilityRatio),
                tier: block.tier,
                category: block.category
            };
        });

        res.status(200).json(scaledBlocks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stand blocks', error: error.message });
    }
};

module.exports = { getMatches, addMatch, getMatchSeatsAndPricing, getBlockSeats, getStandBlocks };

