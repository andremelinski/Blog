require("dotenv").config();
const SECRET_TOKEN = process.env.SECRET_TOKEN
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') //https://auth0.com/learn/json-web-tokens/#!#:~:text=JSON%20Web%20Token%20%28JWT%29%20is%20an%20open%20standard,algorithm%29%20or%20a%20public%2Fprivate%20key%20pair%20using%20RSA.
const Task = require("./task")
const Archive = require("./files")
const Comment = require("./comments")
// request to db
const userSchema  =mongoose.Schema({
    fname : {type: String, required: true, trim: true, lowercase: true},
    lname : {type: String, required: true, trim: true, lowercase: true},
    email : {type: String, required: true, trim: true, lowercase: true, unique:true},
    password : {type: String, required: true, select: false,
    validate(psw){
        if(psw.toLowerCase().includes("password")|| psw.toLowerCase().includes("senha") ){
            throw new Error("Invalid Password");
        }
    }},
    tokens: [{
        token:{type: String, require: true}
    }],
    image:{type:Buffer},
    passwordResetToken: {type: String, select : false},
    passwordResetExpires: {type: Date, select: false}
    },{timestamps: true}
);


// TOKEN
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, SECRET_TOKEN)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
};

// HASH PASSWORD
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});

// DELETE user, task and financial data when a user is removed
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id})
    await Archive.deleteMany({owner: user._id})
    // await Finance.deleteMany({owner: user._id})
    next()
})
//VIRTUAL POPULATING USERS WITH TASK
userSchema.virtual("userTasks",{
    ref: "Task",
    localField: "_id", //where locally the data is
    foreignField: "owner" //how I have named in Task field
});

//VIRTUAL POPULATING USERS WITH FILES
userSchema.virtual("userFiles",{
    ref:"Archive",
    localField: "_id", //where locally the data is
    foreignField: "owner" //how I have named in Task field
})


const User = mongoose.model('User', userSchema);
module.exports=User