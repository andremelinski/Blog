const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const { findByIdAndUpdate, findByIdAndDelete } = require("../models/task");
const Task = require("../models/task")

//CREATING TASK
router.post("/task", middleware.authToken, async(req, res)=>{
    
    try{
        //Destructing req.body and adding req.user._id as owner from auth
        const task = await new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(200).send({message : "Task Created", task : task})
    }catch (e){
        res.status(500).send({error : "task not created"})
    }
});

//Updating task
router.put("/task/:id", middleware.authToken, async(req, res)=>{
    try{
        const update = Object.keys(req.body)
        const allowed = ['description', 'completed']
        const validOperation = update.every((element) => allowed.includes(element))

        if(!validOperation){
            res.status(401).send({message : "You can not update this"})
        }

        const task = await Task.findOne({_id: req.params.id,  owner: req.user._id})

        if(!task){
            res.status(401).send({message : "No tasks here"})
        }
        //updating 
        update.forEach(element => {
            task[element] = req.body[element]
        });

        await task.save()
        res.status(200).send({task})      

    }catch (e){
        res.status(404).send({error : "now possible to update task"})
    }
});

//GETTING ALL TASKS
router.get("/task", middleware.authToken, async(req, res)=>{
    try{
        await req.user.populate("userTasks").execPopulate()
        const tasks = req.user.userTasks
        if(!tasks){
            res.status(401).send({message : "No tasks here"})

        }res.status(200).send({tasks})      
    }catch(e){
        res.status(500).send({error : "something went wrong"})
    }
});

//GETTING TASKS BY THE id OF THEN
router.get("/task/:id", middleware.authToken, async(req, res)=>{

    try{
        const task = await Task.findOne({_id : req.params.id, owner : req.user._id})
    if(!task){
        res.status(404).send({error : "No task here"})
    }
    res.send(task)
    }catch(e){
        res.status(500).send({error : "something went wrong"})
    }
});

//DELETE TASK
router.delete("/task/:id", middleware.authToken, async(req, res)=>{
    
    try{
        const task = await findByIdAndDelete({_id : req.params.id, owner: req.user._id})
    if(!task){
        res.status(404).send({error : "No task here"})
    }
    res.send({message : "task deleted"})
    }catch(e){
        res.status(500).send({error : "something went wrong"})
    }
});
module.exports = router