const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware")
const Archive = require("../models/files")
const Comment = require("../models/comments");

//CREATING COMMENTS
router.post("/gallery/:id/comments", middleware.authToken, async(req, res)=>{

    try{
        const archive = await Archive.findById(req.params.id)
        if(!archive){
            res.status(404).send({error : "No archive"})
        }else{
            Comment.create(req.body, (err,comment)=>{
                if(err) {
                    req.flash("error", "Something went wrong");
                    }
            else{
                comment.author.email = req.user.email; //popuplate with author email 
                comment.author.id = req.user._id; //populate with user _id
                comment.file = req.params.id; //populate with archive _id
                comment.save();
                archive.comments.push(comment);
                archive.save();
                res.send({message : comment})
            }
            })
        }
    }catch(e){
        res.status(500).send({error: e.message})
    }
});

//UPDATING COMMENTS
router.put("/gallery/:id/comments/:comment_id", middleware.authToken, async(req, res)=>{
    try{
        const file = await Archive.findById({_id : req.params.id, owner: req.user._id})
        console.log(file)
        if(!file){
            res.status(401).send({error : "No archive"})
        }else{
            const comment  = await Comment.findByIdAndUpdate(req.params.comment_id, req.body, {new : true, runValidators: true})
        if(!comment){
            res.status(404).send({error : "No archive or comment to update"})
        }
        await comment.save()
        res.status(200).send({message : "comment updated", comment : comment})
        }

    }catch(e){
        console.log(e)
        res.status(500).send({error: e.message})
    }
});

//DELETE COMMENT
router.delete("/gallery/:id/comments/:comment_id", middleware.authToken, async(req, res)=>{
    try{
        const file = await Archive.findById({_id : req.params.id, owner: req.user._id})
        
        if(!file){
            res.status(401).send({error : "No archive"})
        }
        const comment = await Comment.findByIdAndDelete(req.params.comment_id)
        if(!comment){
            res.status(404).send({error : "No comment"})
        }
        res.status(200).send({message : "comment deleted"})
        
    }catch(e){
        res.status(500).send({error: e.message})
    }
})

module.exports = router;