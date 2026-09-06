const mongoose=require('mongoose');
const PasswordResetTokenSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},tokenHash:{type:String,required:true,index:true},expiresAt:{type:Date,required:true}},{timestamps:true});
PasswordResetTokenSchema.index({expiresAt:1},{expireAfterSeconds:0});
module.exports=mongoose.model('PasswordResetToken',PasswordResetTokenSchema);
