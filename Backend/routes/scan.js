const express= require('express');
const { scan, adminDashboard }= require('../controllers/scanController');
const { authenticate }= require('../middleware/auth');

const router = express.Router();
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
}
router.post('/', authenticate, scan);
router.get('/admin/dashboard', authenticate, isAdmin, adminDashboard);

module.exports= router;