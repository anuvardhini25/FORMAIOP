const mongoose=require('mongoose');
const SubmissionSchema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  formId:{type:String,required:true,index:true},
  formVersion:{type:Number,required:true},formSnapshot:{type:mongoose.Schema.Types.Mixed,default:null},
  values:{type:mongoose.Schema.Types.Mixed,default:{}},
  aiAssistedFields:{type:[String],default:[]},
  status:{type:String,enum:['draft','submitted','under_review','completed'],default:'draft',index:true},
  currentStep:{type:Number,default:0,min:0},
  createdAt:{type:Date,default:Date.now},updatedAt:{type:Date,default:Date.now},submittedAt:{type:Date,default:null}
},{versionKey:false});
SubmissionSchema.pre('save',function(next){this.updatedAt=new Date();next();});
module.exports=mongoose.model('Submission',SubmissionSchema);
