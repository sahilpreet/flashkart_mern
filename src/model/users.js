const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
        }
    }],
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'        
    }],
    // password2:{
    //     type:String,
    //     required:true,
    //     // validate:
    // }
},{timestamps:true})

//statics lookfor whole collection while method work on one document
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await users.findOne({ username: username })
    // console.log(user)
    if (!user) {
        throw new Error(`email ${username} donot exists.`)
    }
    const passwordMatch = await bcryptjs.compare(password, user.password)
    if (!passwordMatch) {
        throw new Error(`email ${username} and password do not match`)
    }
    return user
}

//always use function with this
userSchema.methods.generateAuthToken = async function(){
    //give access to document that is saving by using this keyword(can only use this but it confuses)
    const user = this
    // console.log(user,process.env.PORT,process.env.JWT_SECRET)
    //generate token for login
    const tokenGenerated = await jsonwebtoken.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "300 days" })
    //save token in list of tokens
    user.tokens=user.tokens.concat({token:tokenGenerated})
    await user.save()
    return tokenGenerated
}


userSchema.pre("save", async function (next) {
    //give access to document that is saving by using this keyword(can only use this but it confuses)
    const user = this
    //true for created or modified document return true for null or when password is changed
    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 8)
    }
    //next is used to run the operation after the upper one code indicate the function is completed
    next()
})

const users = mongoose.model('user', userSchema)

module.exports = users