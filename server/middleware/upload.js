import multer from 'multer';import path from 'path';import crypto from 'crypto';
const storage=multer.diskStorage({destination:'uploads/',filename:(req,file,cb)=>cb(null,crypto.randomUUID()+path.extname(file.originalname).toLowerCase())});
export const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','application/pdf'].includes(file.mimetype))});
