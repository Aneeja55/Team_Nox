const express= require('express');
const userController = require('../controllers/userController');
const { authenticate }= require('../middleware/auth');

const router = express.Router();
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
}
router.post('/', authenticate, isAdmin, userController.register);
router.get('/scanned-users', authenticate, isAdmin, userController.getScannedUsers);
router.get('/', authenticate, isAdmin, userController.users);
router.delete('/:userId', authenticate, isAdmin, userController.deleteUser);
router.put('/:userId', authenticate, isAdmin, userController.updateUser);

module.exports= router;