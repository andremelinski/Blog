const { Mongoose } = require("mongoose")

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    complete : {type: Boolean, default: false},
    description : {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, require:true, ref:'User'}
},{
    timestamps:true
});

const Task = mongoose.model('Task', taskSchema);
module.exports=Task