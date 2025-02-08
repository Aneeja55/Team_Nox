const Scan = require('../models/Scan');
const qrcode = process.env.QR_CODE;
const moment = require('moment'); // Import moment

exports.scan = async (req, res) => {
    const { type, code } = req.body;
    const userId = req.userId;

    // Validate QR code
    if (code !== qrcode) {
        return res.status(400).json({ error: 'Invalid QR code' });
    }

    // Get current time using moment
    const now = moment();
    const hours = now.hours();
    const minutes = now.minutes();

    // Validate lunch scanning time
    if (type === 'lunch' && !(hours >= 11 && minutes >= 30 && hours < 14)) {
        return res.status(400).json({ error: 'Lunch scanning is only allowed between 11:30 AM and 2:00 PM' });
    }

    // Validate snack scanning time
    if (type === 'snack' && !(hours >= 15 && minutes >= 30 && hours < 17)) {
        return res.status(400).json({ error: 'Snack scanning is only allowed between 3:30 PM and 5:00 PM' });
    }

    try {
        // Check if the user has already scanned today
        const startOfDay = moment().startOf('day').toDate(); // Start of the current day
        const existingScan = await Scan.findOne({
            userId,
            type,
            date: { $gte: startOfDay }
        });

        if (existingScan) {
            return res.status(400).json({ error: 'Already scanned today' });
        }

        // Save the new scan
        const scan = new Scan({ userId, type, date: now.toDate() }); // Store the current date
        await scan.save();

        res.json({ message: 'Scan successful' });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: 'Error processing scan' });
    }
};