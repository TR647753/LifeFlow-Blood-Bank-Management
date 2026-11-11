import {Router} from 'express';
import {DonationCamp,CampRegistration,Donor,Notification} from '../models/index.js';
import {auth} from '../middleware/auth.js';
const r=Router();
const eligible={active:true,authorized:true,date:{$gte:new Date(new Date().setHours(0,0,0,0))}};
async function announce(camp){
 if(!camp.active||!camp.authorized||!camp.date||new Date(camp.date)<new Date(new Date().setHours(0,0,0,0)))return;
 const donors=await Donor.find({active:true,approval:'Approved'}).select('_id');
 if(donors.length)await Notification.insertMany(donors.map(d=>({recipient:d._id,role:'donor',title:'New Blood Donation Camp',message:`${camp.name} — ${camp.address}, ${camp.city}. Date: ${new Date(camp.date).toLocaleDateString('en-IN')}. Open Donation Camps to register.`})),{ordered:false});
}
r.get('/',auth('admin','donor'),async(req,res,next)=>{try{res.json(await DonationCamp.find(req.role==='donor'?eligible:{}).sort({date:1,createdAt:-1}))}catch(e){next(e)}});
r.get('/my-registrations',auth('donor'),async(req,res,next)=>{try{res.json(await CampRegistration.find({donor:req.user._id}).populate('camp').sort({createdAt:-1}))}catch(e){next(e)}});
r.post('/:id/register',auth('donor'),async(req,res,next)=>{try{const camp=await DonationCamp.findOne({_id:req.params.id,...eligible});if(!camp)return res.status(404).json({message:'Active verified upcoming camp not found'});const reg=await CampRegistration.findOneAndUpdate({camp:camp._id,donor:req.user._id},{$set:{status:'Registered'}},{new:true,upsert:true,runValidators:true});res.json(reg)}catch(e){next(e)}});
r.patch('/:id/cancel',auth('donor'),async(req,res,next)=>{try{const reg=await CampRegistration.findOneAndUpdate({camp:req.params.id,donor:req.user._id,status:'Registered'},{$set:{status:'Cancelled'}},{new:true});if(!reg)return res.status(404).json({message:'Registration not found'});res.json(reg)}catch(e){next(e)}});
r.post('/',auth('admin'),async(req,res,next)=>{try{const {name,address,city,district,date,authorized}=req.body;if(!name?.trim()||!address?.trim()||!city?.trim()||!date)return res.status(400).json({message:'Name, address, city and date are required'});const camp=await DonationCamp.create({name:name.trim(),address:address.trim(),city:city.trim(),district,date,authorized:!!authorized});await announce(camp);res.status(201).json(camp)}catch(e){next(e)}});
r.patch('/:id',auth('admin'),async(req,res,next)=>{try{const fields=['name','address','city','district','date','active','authorized'];const patch=Object.fromEntries(Object.entries(req.body).filter(([k])=>fields.includes(k)));const before=await DonationCamp.findById(req.params.id);if(!before)return res.status(404).json({message:'Camp not found'});const camp=await DonationCamp.findByIdAndUpdate(req.params.id,{$set:patch},{new:true,runValidators:true});if(camp.active&&camp.authorized&&(!before.active||!before.authorized||String(before.date)!==String(camp.date)))await announce(camp);res.json(camp)}catch(e){next(e)}});
export default r;
