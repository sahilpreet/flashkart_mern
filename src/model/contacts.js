const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        // unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim:true,
    },
    comment: {
        type: String,
        required: true,
        trim:true,
    },
    // password2:{
    //     type:String,
    //     required:true,
    //     // validate:
    // }
},{timestamps:true})

const contacts= mongoose.model('contact',contactSchema)

module.exports=contacts