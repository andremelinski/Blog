require("dotenv").config();
require("./db/mongoose")
const express = require("express");
const app = express();
const port = process.env.PORT

// IMPORTING ROUTES 
const ruser = require("./routes/ruser")
const rtask = require("./routes/task")
const rfiles = require("./routes/rfiles")
const rcomments = require("./routes/comments")
// USING ROUTES
app.use(express.json());
app.use(ruser)
app.use(rtask)
app.use(rfiles)
app.use(rcomments)




app.listen(port, ()=>{
    console.log(port)
})