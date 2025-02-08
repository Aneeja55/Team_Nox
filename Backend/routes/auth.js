const express= require('express');
const { register, login, adminLogin } = require('../controllers/authController');
const { authenticate }= require('../middleware/auth');
const router= express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
}
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/user/protected', authenticate, (req, res) => { res.json({sucess: true, message: 'Protected route accessed successfully' }); });
router.get('/admin/protected', authenticate, isAdmin, (req, res) => { res.json({sucess: true, message: 'Protected route accessed successfully' }); });

module.exports = router;