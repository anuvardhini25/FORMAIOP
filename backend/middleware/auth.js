const jwt=require('jsonwebtoken');
const User=require('../models/User');
function secret(){if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured'); return process.env.JWT_SECRET;}
function signToken(user,remember=false){return jwt.sign({sub:String(user._id),role:user.role},secret(),{expiresIn:remember?'30d':'2h'});}
async function requireAuth(req,res,next){try{const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):null;if(!token)return res.status(401).json({success:false,message:'Authentication required'});const payload=jwt.verify(token,secret());const user=await User.findById(payload.sub);if(!user)return res.status(401).json({success:false,message:'Authentication required'});req.user=user;req.userId=user._id;next();}catch(e){return res.status(401).json({success:false,message:'Your session has expired. Please sign in again.'});}}
module.exports={requireAuth,signToken};
