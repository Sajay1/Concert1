const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [25, 'Name cannot exceed 500 characters']
    },
    Email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    Password: {

        
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'atleast 8 characters required']
    },
    Role:{
        type:String,
        required:[true,'Role is required'],
        enum:["Admin","User"],
        default:'User'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;