const Scan = require('../models/Scan');
const qrcode = process.env.QR_CODE;
const moment = require('moment'); // Import moment
const User = require('../models/User');

exports.scan = async (req, res) => {
    try {
        const { type, code } = req.body; // Extract type and code from request body
        const userId = req.userId; // Extract userId from middleware (e.g., authentication)

        // 1. Validate QR code
        if (!code || code !== qrcode) {
            return res.status(400).json({ error: 'Invalid QR code' });
        }

        // 2. Get current time using moment
        const now = moment();

        // Define valid time ranges for lunch and snack
        const lunchStart = moment().set({ hour: 11, minute: 0, second: 0, millisecond: 0 });
        const lunchEnd = moment().set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
        const snackStart = moment().set({ hour: 15, minute: 30, second: 0, millisecond: 0 });
        const snackEnd = moment().set({ hour: 17, minute: 0, second: 0, millisecond: 0 });

        // Validate scanning time
        if (type === 'lunch') {
            if (!now.isBetween(lunchStart, lunchEnd)) {
                return res.status(400).json({
                    error: 'Lunch scanning is only allowed between 11:00 AM and 2:00 PM',
                });
            }
        } else if (type === 'snack') {
            if (!now.isBetween(snackStart, snackEnd)) {
                return res.status(400).json({
                    error: 'Snack scanning is only allowed between 3:30 PM and 5:00 PM',
                });
            }
        } else {
            return res.status(400).json({ error: 'Invalid scan type' });
        }

        // 3. Check if the user has already scanned today
        const startOfDay = moment().startOf('day').toDate(); // Start of the current day
        const endOfDay = moment().endOf('day').toDate(); // End of the current day
        const existingScan = await Scan.findOne({
            userId,
            type,
            date: { $gte: startOfDay, $lt: endOfDay }, // Scans made after the start of the day and before the end of the day
        });

        if (existingScan) {
            return res.status(400).json({ error: 'Already scanned today' });
        }

        // 4. Save the new scan
        const scan = new Scan({
            userId,
            type,
            date: now.toDate(), // Store the current date and time
        });

        await scan.save(); // Save the scan to the database

        // 5. Return success response
        return res.json({ message: 'Scan successful' });
    } catch (err) {
        console.error('Error processing scan:', err); // Log the error for debugging
        return res.status(500).json({ error: 'Error processing scan' });
    }
};

exports.adminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const startOfDay = moment().startOf('day').toDate(); // Start of the current day

        // Fetch lunch scans for the current day
        const lunchScans = await Scan.find(
            { type: 'lunch', date: { $gte: startOfDay } }
        ).populate('userId', 'username');

        const lunchUsers = lunchScans.map(scan => ({
            id: scan.userId._id,
            username: scan.userId.username,
            time: moment(scan.date).format('hh:mm A'), // Format time
            date: moment(scan.date).format('YYYY-MM-DD') // Format date
        }));

        const totalLunchScans = lunchScans.length;

        // Fetch snack scans for the current day
        const snackScans = await Scan.find(
            { type: 'snack', date: { $gte: startOfDay } }
        ).populate('userId', 'username'); // Populate username (exclude password)

        const snackUsers = snackScans.map(scan => ({
            id: scan.userId._id,
            username: scan.userId.username,
            time: moment(scan.date).format('hh:mm A'), // Format time
            date: moment(scan.date).format('YYYY-MM-DD') // Format date
        }));

        const totalSnackScans = snackScans.length;

        // Return response
        res.json({
            totalUsers,
            totalLunchScans,
            lunchUsers,
            totalSnackScans,
            snackUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
};
