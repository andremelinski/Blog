var mongoose = require("mongoose");
 
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        email: { type: String }
    },
    file : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Archive'
    }
},{
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);