import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp") // cb(error, result) null means no error
    },

    /*
        You're telling Multer to store uploaded files on disk, not in memory.
        cb(null, "./public/temp") tells Multer to save the file in the ./public/temp directory.
        
    */
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})