const jsonwebtoken = require('jsonwebtoken');
const users=require("../model/users")

const auth=async (req,res,next)=>{
    try {
        // console.log("auth")
        const token=req.header("Authorization").replace("Bearer ","")
        // console.log(token)
        // const user=users.find({token.})
        const decoded=await jsonwebtoken.verify(token,process.env.JWT_SECRET)
        // console.log(decoded)
        //return 1 not array
        const user=await users.findOne({_id:decoded._id})
        // console.log(user)
        if(!user){
            throw new Error("user not found")
        }
        req.token=token
        req.user=user
    } catch (error) {
        // res.send({error:error.message})
    }
    //make the next function in row to run
    next()
}

module.exports=auth