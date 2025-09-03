

import multer from "multer";
import fs from "fs";

export const MIME_GROUPS = {
  images: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml'
  ],
  videos: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo', // avi
    'video/x-matroska' // mkv
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4'
  ],
  docs: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
};
export const ALL_MIME_TYPES = Object.values(MIME_GROUPS).flat();



export const multerUploadLocal = (custemPrameter,custemExtation=[]) => {
    const fullPath= `uploads/${custemPrameter}`
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath); // هنا بيتخزن في فولدر uploads
    },
    filename: function (req, file, cb) {
      console.log(file); // هتلاقي هنا mimetype, originalname, إلخ
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '-' +file.originalname ); // الاسم اللي هيتخزن بيه
    },
  });

function fileFilter(req , file, cb) {

    if (!custemExtation.includes(file.mimetype)) {
        cd (new Error('File type is not allowed'))

    }else{
        cb(null, true)
    }

} 
  const upload = multer({ storage,fileFilter });
  return upload;
};


export const multerUploadhost = ({custemExtation=[]}) => {
 
  const storage = multer.diskStorage({});

function fileFilter(req , file, cb) {

    if (!custemExtation.includes(file.mimetype)) {
        cd (new Error('File type is not allowed'))

    }else{
        cb(null, true)
    }

} 
  const upload = multer({ storage,fileFilter });
  return upload;
};
  
