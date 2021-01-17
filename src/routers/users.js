const express = require('express');
const users = require('../model/users');
const auth=require("../middleware/auth");
const contacts = require('../model/contacts');

const router=new express.Router()


router.post("/register",async (req,res)=>{
    try {
        const valuesRecieved=Object.keys(req.body)
        const valuesRequired=["username","password"]
        const isValidOperation=valuesRecieved.every((element)=>valuesRequired.includes(element))
        // console.log(req.body,"alfba",isValidOperation)
        if(isValidOperation){
            // console.log(isValidOperation,"ejhbfjb")
            const enteredUser= new users(req.body)
            await enteredUser.save()
            // console.log(enteredUser,"kgjkjdnkgn")
            res.send(enteredUser)
        }else{
            res.send({})
        }
    } catch (error) {
        // console.log(error.message)
        res.send({error:error.message})
    }
})

router.post("/login",async (req,res)=>{
    try {
        // console.log(req.body)
        const user=await users.findByCredentials(req.body.username,req.body.password)
        // console.log(user)
        const tokenGenerated=await user.generateAuthToken()
        // console.log({user,tokenGenerated})
        res.status(200).send({user:user,token:tokenGenerated})
    } catch (error) {
        res.send({error:error.message})   
    }
})
router.post("/logout",auth,async (req,res)=>{
    try {
        // console.log(req.user,req.token)
        // const user=req.user
        req.user.tokens=req.user.tokens.filter((element)=>element.token!=req.token)
        console.log(req.user.tokens.includes(req.token))
        await req.user.save()
        res.send({tokenloggedout:req.token})
    } catch (error) {
        res.send({error:error.message})        
    }
})

router.post("/contactus",async(req,res)=>{
    try {
        const contactusEntered=await contacts(req.body)
        const contactusSaved=await contactusEntered.save()
        if(contactusSaved){
            res.send({created:true})
        }else{
            res.send({created:false})
        }
    } catch (error) {
        res.send({error:error.message})        
    }
})

module.exports=router