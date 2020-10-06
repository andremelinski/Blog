const mongoose = require("mongoose");
const Comment = require('../models/comments')

const archiveSchema = new mongoose.Schema({
    images: {type: Buffer},
    description : {type : String},
    owner: { type : mongoose.Schema.Types.ObjectId, require:true, ref:'User' },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
},{
    timestamps: true
});

//VIRTUAL POPULATING FILES WITH COMMENTS
archiveSchema.pre('remove', async function(next){
    const files = this;
   
    await Comment.deleteMany({file: files._id})
    
    next()
});
archiveSchema.virtual('filesId',{
    ref:'Comment',
    localField:'_id',
    foreignField:'files'
});

const Archive = mongoose.model('Archive', archiveSchema);
module.exports= Archive