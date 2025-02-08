const mongoose= require('mongoose');

const userSchema= new mongoose.Schema({                            //login details connected to db
    username:{ type: String, required: true, unique: true },
    password:{ type: String, required: true, unique: true },
    role:{ type: String, enum: ['admin', 'user'], default: 'user' }
});
module.exports= mongoose.model('User', userSchema);