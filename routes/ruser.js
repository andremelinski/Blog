const express = require('express');
const router = new express.Router(); //use route
const bcrypt = require("bcryptjs"); //hash password
const middleware = require("../middleware/middleware")
const multer = require("multer");
const sharp = require("sharp");
const crypto = require("crypto")
const User = require("../models/user"); //user.Schema
const { findOne, findByIdAndUpdate } = require('../models/user');
const { update } = require('../../BudgetApp/src/models/mainUser');

// Creating new user
router.post("/register", async(req, res)=>{

    try{
        const {email} = req.body; 
        const user = new User(req.body);

        if(await User.findOne({email})){
            res.status(400).send({error : "User already register"});
        }
        await user.save()
        sendWelcomeEmail(user.email, user.fname, user.lname)
        const token = await user.generateAuthToken() //generate and save token
        user.password = undefined
        
        res.status(201).send({user: user, token : token})

    }catch (e){
       
        res.status(500).send({error : "Something went wrong"});
    }
});

//Login
router.post("/login", async(req, res)=>{

    try{
        const {email, password} = req.body;

        // cheking user 
        const user = await User.findOne({email}).select("+password") //grab the password hided

        if(!user){
            return res.status(400).send({error : "No user register"})
        }
        // checkinh password
        if(!await bcrypt.compare(password, user.password)){
            return res.status(400).send({error : "Password is wrong"})
        }      
        const token = await user.generateAuthToken()
        user.password = undefined; //hide password

        res.send({
            user : user,
            token : token
        }) //return all info from user

    }catch(e){
        console.log(e)
        res.status(500).send({error : "Something went wrong"})
    }
});

//USER NEEDS TO BE AUTHENTICATED TO PROCEED
//ADDING AVATAR IMAGE
//multer for config the image
const imagesUpload = multer({

    limits:{fileSize: 2000000},
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('This is not a picture or file size is over 2 MB.'))
        }
        cb(null,true)
    }
});

router.post('/user/:id/avatar', middleware.authToken, imagesUpload.single('avatar'), async(req,res) => {

    try{
        const user = await User.findById(req.params.id)
        if(!user){
            res.status(404).send({error : "user not found"})
        }
        const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()

        req.user.image = buffer
        await req.user.save()
        res.set('Content-Type', 'image/png')
        res.send(user.image)
    }
    catch (error){
        res.status(500).send({error : error.message})
    }
});

//RETRIEVING AVATAR IMAGE  --> Does not need authentification
router.get("/user/:id/avatar", async(req,res)=>{
    
    try{
        const user = await User.findById(req.params.id)
        if(!user){
            res.status(404).send({error : "user not found"})
        }else if(!user.image){
            res.status(401).send({error: "no image"})
        }
        res.set('Content-Type', 'image/png')
        res.send(user.image)
    }catch(e){
        res.status(500).send({error : "Something went wrong"})
    }
})

//DELETE PHOTO
router.delete("/user/:id/avatar", middleware.authToken, async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user){
            res.status(404).send({error : "user not found"})
        }
        req.user.image = undefined
        await req.user.save()
        res.send({message : "profile image deleted"})
    }catch(e){
        res.status(500).send({error: "Something went wrong"})
    }
})

//UPDATE USER
router.put("/user/:id", middleware.authToken ,async(req, res)=>{

    try{
        const variables = Object.keys(req.body) //transform the req.body in keys
        const allowedUpdate = ["fname", "lname", "email"]
        const validoperation = variables.every((variable)=> allowedUpdate.includes(variable)) //for every variable in variables, if all "variable" are allowed and are include in allowedUpdate, update

        //Not valid operation
        if(!validoperation){
            res.status(401).send({error : "Operation not allowed"})
        }
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators : true}); //updating user
        if(!user){
            res.status(404).send({error : "No user found"})
        }
        //saving updated info
        // await user.save()
        res.status(200).send({user : user})

    }catch(e){
        res.status(500).send({error : "Something went wrong"})
    }
});

//UPDATE PASSWORD
router.post("/forgot_password", async(req, res)=>{
    const {email} = req.body
    
    try{
        const user = await User.findOne({email})
        if(!user){
            res.status(404).send({message : "email does not exist"})
        }
        const token = crypto.randomBytes(20).toString("hex");
        const now = new Date();

        now.setHours(now.getHours()+1);
        await User.findByIdAndUpdate(user._id, {
            "$set" : {
                passwordResetToken : token,
                passwordResetExpires : now
            }
        })
        // forgotPassword(user.email, user.passwordResetToken, user.passwordResetExpires)
        console.log(token)
        return res.status(201).send({message : "email sent"})
    }catch(e){
        console.log(e)
        res.status(500).send({error : "Something went wrong"})
    }
})

//RESET PASSWORD
router.post("/reset_password", async(req, res)=>{
    const {email, token ,password} = req.body
    try{
        const user = await User.findOne({email}).select("+passwordResetToken passwordResetExpires")
        
        if(!user){
            return res.status(404).send({error : "User not found"})
        }
        if(token !== user.passwordResetToken){
            return res.status(404).send({error : "Invalid token"})
        }
        const now = new Date();
        if(now > user.passwordResetExpires){
            return res.status(404).send({error : "the token has expired. Please send a request again"})
        }
        user.password = password
        await user.save();
        res.status(200).send({message : "Update password"})

    }catch(e){
        console.log(e)
        res.status(500).send({error : "Could not reset password"})
    }
})

//LOGOUT USER LOCALLY
router.post("/logout/:id", middleware.authToken, async(req, res)=>{
    //const allTokens = req.user.tokens;
    //const actual = req.token

    try{
        req.user.tokens = req.user.tokens.filter((item)=>{
            return(item.token !== req.token)
        })
        await req.user.save()
        res.status(200).send({message : "You have logout"})
    }
    catch (e){
        res.status(500).send({error : "Something went wrong"})
    }
});

//LOGOUT USER FROM ALL
router.post("/exit", middleware.authToken, async(req, res)=>{
    try{
        req.user.tokens = [] //all tokens will be excluded
    await req.user.save()
    res.status(200).send({message : "You have logout from all"})
    }
    catch(e){
        res.status(500).send({error : "Something went wrong"})
    }
});

//DELETE USER
router.delete('/user/me', middleware.authToken ,async(req,res)=>{
    try{
        await req.user.remove() //Removes node
        sendGoodByeEmail(req.user.email, req.user.fname, user.lname)
        res.send({message : "account deleted"})
    }catch(e){res.status(500).send()}
});
module.exports = router