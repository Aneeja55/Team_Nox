require('dotenv').config();
const express= require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const scanRoutes= require('./routes/scan');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/users', require('./routes/users'));



app.get('/',(req,res)=>{
    res.send('Digital MESS Card');      //Route
});
app.get('/generate',(req,res)=>{
    res.sendFile(__dirname + '/public/generate.html');
})
const PORT= process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});