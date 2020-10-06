const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_TOKEN = process.env.SECRET_TOKEN
let middleware={};
const User = require("../models/user")

//Checking Token
middleware.authToken = (req, res, next)=>{
    try{
        //Does token exist?
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).send({error: "No token provided"})
        }
        //Baerer Token
        const parts = authHeader.split(" ");
        if(!parts.length===2){
            return res.status(401).send({error : "Token error"})
        }
        //Checking if starts with Bearer
        const [bearer, token] = parts;
        if(!(/^Bearer$/i.test(bearer))){
            return res.status(401).send({error : "Token invalid"})
        }
        //Checking if wrong token
        jwt.verify(token, SECRET_TOKEN, async(err, decoded)=>{

            if(err){
                res.status(401).send({error : "Token malformatted"})
            }

            const user = await User.findOne({_id: decoded._id, 'tokens.token':token})

            if(!user){res.status(404).send({error : "user not found"})}
            req.user = user
            req.token=token
            next()
        })
    }catch (e){
        console.log(e)
        res.status(500).send({error : "something get wrong"})
    }
};

module.exports = middleware