const dbPool = require('../config/db');

const addStadium = async (req, res) => {
    const { name, layout_data } = req.body;

    try {
        const newStadium = await dbPool.query(
            'INSERT INTO Stadiums (name, layout_data) VALUES ($1, $2) RETURNING *',
            [name, JSON.stringify(layout_data)]
        );
        res.status(201).json(newStadium.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add stadium', error: error.message });
    }
};

const getStadiums = async (req, res) => {
    try {
        const stadiums = await dbPool.query('SELECT id, name FROM Stadiums');
        res.status(200).json(stadiums.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stadiums', error: error.message });
    }
};

module.exports = { addStadium, getStadiums };