const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    action : {type : Boolean, required: true},
    value: { type : Number, required : true}
},{
    timestamps: true
})