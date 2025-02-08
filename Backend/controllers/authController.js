const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET;

exports.login = async (req, res) => {                                          //Authenticate access
    const { username, password } = req.body;
    try {
        const user= await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {       // //to check whether the login details are valid
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token= jwt.sign({ userId: user._id , role: user.role}, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
};
//admin login
exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, role: 'admin' });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret);
        res.status(200).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
};