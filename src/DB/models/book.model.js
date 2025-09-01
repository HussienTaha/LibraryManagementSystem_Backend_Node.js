 import mongoose from "mongoose";
 const bookschema = new mongoose.Schema({
    title:{type:String,required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
   createdwith: {
  type: String,
  required: true,
  trim: true
},
    author:{type:String,required:true},
    pupisherYear:{type:Number,required:true},
    availableCopies:{type:Number,required:true,default:1},
    createdAt:{type:Date,default:Date.now()},
    isDeleted:{type:Boolean,default:false},
    deletedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 },{timestamps:true})
 const Bookmodel= mongoose.models.Book || mongoose.model('Book',bookschema)
 export default Bookmodel;