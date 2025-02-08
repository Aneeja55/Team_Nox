const express= require('express');
const userController = require('../controllers/usersController');
const { authenticate }= require('../middleware/auth');

const router = express.Router();
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
}
router.get('/users', authenticate, isAdmin, userController.register);
router.get('/scanned-users', authenticate, isAdmin, userController.getScannedUsers);
router.get('/users', authenticate, isAdmin, userController.users);
router.delete('/users/:userId', authenticate, isAdmin, userController.deleteUser);
router.put('/users/:userId', authenticate, isAdmin, userController.updateUser);

module.exports= router;