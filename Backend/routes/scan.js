const express= require('express');
const { scan }= require('../controllers/scanController');
const { authenticate }= require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, scan);

module.exports= router;