import jwt from 'jsonwebtoken';
import {Admin,Donor,Patient} from '../models/index.js';
const models={admin:Admin,donor:Donor,patient:Patient};
export const auth=(...roles)=>async(req,res,next)=>{try{const token=(req.headers.authorization||'').replace(/^Bearer /,'');const data=jwt.verify(token,process.env.JWT_SECRET);if(roles.length&&!roles.includes(data.role))return res.status(403).json({message:'Forbidden'});const user=await models[data.role]?.findById(data.id);if(!user||!user.active)return res.status(401).json({message:'Account unavailable'});req.user=user;req.role=data.role;next()}catch(e){res.status(401).json({message:'Please sign in'})}};
