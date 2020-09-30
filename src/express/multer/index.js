const multer = require("multer");
const path = require('path');

const fileName = {};
const storage = multer.diskStorage({
    destination: function (req, file, next) {
      next(null, path.resolve(__dirname,`../public/img/`));
    },
    filename: function (req, file, next) {
        fileName.name = file;
        next(null,file.originalname);
    },
});

const fileFilter = (req,file,next)=> {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/webp") {
        next(null, true);
      } else {
        next(null, false);
        return next(new Error('Only .png, .jpg , .jpeg and webp format allowed!'));
      }
} 

const upload = multer({ storage: storage,fileFilter: fileFilter }).single(`avatar`);

exports.uploadFile = async (req,res,next) => {
    
    upload(req,res,function (err) {
        try {
            if (err) {
                console.log(err.message)
                return res.send(err.message)
            } 
            if (!fileName.name) {
                next();
                return;
            }
            req.body.avatar = fileName.name.originalname;
            next(); 
        }catch (err) {
            console.log(`${err.message}`)
            next(err)
        }   
    })
};

exports.deleteFile = async (req,res,next) => {
    if (fileName.name) {
        delete fileName.name;
    }
    next();
}