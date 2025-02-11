const jwt= require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

exports.authenticate= (req,res,next) => {            
    const token=req.header('x-access-token');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try{
        const decoded= jwt.verify(token, jwtSecret);
        req.userId= decoded.userId;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};