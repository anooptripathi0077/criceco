const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbPool = require('../config/db');
require('dotenv').config();

const generateToken = (res, id, role, email) => {
    const token = jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

const registerUser = async (req, res) => {
    const { name, email, password, role = 'User' } = req.body;

    try {
        const userExists = await dbPool.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await dbPool.query(
            'INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );

        const user = newUser.rows[0];
        generateToken(res, user.id, user.role, user.email);

        res.status(201).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await dbPool.query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            generateToken(res, user.id, user.role, user.email);
            res.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await dbPool.query('SELECT id, name, email, role FROM Users WHERE id = $1', [decoded.id]);
        const user = result.rows[0];

        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };