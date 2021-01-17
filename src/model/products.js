const mongoose = require('mongoose');

const productsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    category:{
        type:String,
        required:true,
        trim:true,
    },
    subcategory:{
        type:String,
        required:true,
        trim:true,
    },
    regularprice:{
        type:Number,
        required:true,
        trim:true,
    },
    discountedprice:{
        type:Number,
        required:true,
        trim:true,
    },
    image:{
        type:Buffer,
    }
},{timestamps:true})

//delete some fields from all the json returning
productsSchema.methods.toJSON=function(){
    const user=this
    const userObj=user.toObject()
    delete userObj.image
    return userObj
}

//to search in model for all fields
productsSchema.index({name:"text",category:"text",subcategory:"text"})

const products=mongoose.model("product",productsSchema)

module.exports=products