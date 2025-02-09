const Scan = require('../models/Scan');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const user = new User({ username, password: hashedPassword, role: 'user' });
        await user.save();
        let token = jwt.sign({ userId: user._id , role: 'user'}, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user' });
    }
};

exports.users = async (req, res) => {
    try {
        const users = await User.find({
            role: { $ne: 'admin' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(userId, { username, password: hashedPassword, role }, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Error updating user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

//get the scanned user of the current day for the lunch and snacks
exports.getScannedUsers = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const scans = await Scan.find({ date: { $gte: startOfDay, $lt: endOfDay } });
        const scannedUsers = scans.map(scan => scan.userId);
        res.json(scannedUsers);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching scanned users' });
    }
};