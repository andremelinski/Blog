const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const multer = require("multer")
const sharp = require("sharp")
const { findOne, findByIdAndDelete } = require("../models/files");
const Archive = require("../models/files")

//CREATING GALLERY
const imagesUpload = multer({

    limits:{fileSize: 2000000},
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('This is not a picture or file size is over 2 MB.'))
        }
        cb(null,true)
    }
});

//UPLOAD IMAGE
router.post("/gallery/upload", middleware.authToken, imagesUpload.single('photos'),async(req, res)=>{
    try{
        const archive = new Archive({
            ...req.body,
            owner: req.user._id
        })
   
        const image = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
       
       archive.images = image

        await archive.save()
       
        res.send()
    }catch(e){
        res.status(500).send({error : "something went wrong"})
    }
});

//ADDING description 
router.put("/gallery/:id",middleware.authToken, async(req, res)=>{
    const description = Object.keys(req.body)
    const allowed = ["description"]
    const allowedUpdate = description.every(element => allowed.includes(element))
    try{
        const photo = await Archive.findOne({_id : req.params.id, owner: req.user._id})
       
        if(!photo){
            res.status(404).send({error : "No photo detected"})
        }else if(!allowedUpdate){
            res.status(401).send({error : "you can not update this"})
        }

        description.forEach(element => photo[element] = req.body[element])
        await photo.save()

        res.send({message : photo.description})
    }catch(e){

        res.status(500).send({error : "something went wrong"})
    }
});

//GETTING ALL IMAGES
router.get("/gallery", middleware.authToken, async(req, res)=>{
    try{
        await req.user.populate("userFiles").execPopulate()
        const photos = req.user.userFiles
        if(!photos){
            res.status(401).send({message : "No photos here"})
        }
        res.set('Content-Type', 'image/png')
        res.status(200).send({photos}) 

    }catch(e){
        res.status(500).send({error : "something went wrong"})
    }
});

//DELETING IMAGE
router.delete("/gallery/:id", middleware.authToken, async(req, res)=>{
    try{
        const photo = await Archive.findOne({_id : req.params.id, owner: req.user._id}) 
        // const photo = await Archive.findByIdAndDelete({_id : req.params.id, owner: req.user._id})
       
        if(!photo){
            res.status(404).send({error : "No photo detected"})
        }
        await photo.remove()
        res.send({message : "Photo deleted"})
    }catch(e){
        console.log(e)
        res.status(500).send({error : "something went wrong"})
    }
});

module.exports = router
//WRONG ROUTE
// router.post("/gallery/upload", middleware.authToken, imagesUpload.single('photos'),async(req, res)=>{
//     try{
//         const archive = new Archive({
//             ...req.body,
//             owner: req.user._id
//         })
//         console.log(archive)
//         const file = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
//        console.log(file)
//        archive.files = archive.files.concat({file})

//         await archive.save()
//         console.log(archive)
//         res.send()
//     }catch(e){
//         console.log(e)
//         res.status(500).send({error : "something went wrong"})
//     }
// });