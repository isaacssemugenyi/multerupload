//Requiring dependencies
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();
//Require FileSystem inbuilt module to help us delete the image
const fs = require('fs');

//Connecting to the DB
mongoose.connect('mongodb://localhost:27017/formidable', { useUnifiedTopology: true ,  useNewUrlParser: true  })

//Setting the view engine
app.set('view engine', 'pug');
app.set('views', './views');

//Requiring middleware
app.use('/uploads' , express.static('uploads'));
app.use(express.urlencoded({extended: true}))

//Creating a Schema for the data to be input
const uploadSchema = mongoose.Schema({
    fileName: String,
    filePath: String
})

const Upload = mongoose.model('UploadThree', uploadSchema);

//Route serving the homepage
app.get('/', (req, res)=>{
    //Query db for all documents 
    Upload.find((err, uploads)=>{
        if(err) console.log(err);
        //Parsing the returned documents to the home view
        res.render('home', {title: "Home page", uploads: uploads})
    })
})
//multer file uploader
//set Storage
const storage = multer.diskStorage({
    //Define storage location on Server
    destination: (req, file, cb)=>{
        cb(null, 'uploads')
    },
    //Give a new name to the uploaded image
    filename: (req, file, cb)=>{
        cb(null, "1234" + file.originalname)
    }
})

//Assigning the variable upload with an object that contains methods of storage
const upload = multer({storage: storage});

//Route for receiving client submitted data
app.post('/', upload.single('filePath') , async (req, res)=>{
   //Creating an instance of Upload model using the client inputs
    const upload = new Upload();
    upload.fileName = req.body.fileName;
    upload.filePath = req.file.path;

    try {
        //Saving the data submitted to the database and redirect / if ok
        await upload.save((err, result)=>{
            if(err) console.log(err);
            res.redirect('/')
        })  
    } catch(error){
        console.log(error)
    }
})

//Router to delete the document
app.get('/delete/:id', (req, res)=>{
    //We store the id params in id
    let id = req.params.id;
    //We find the document by id from DB and parse the document as well in a callback
    Upload.findByIdAndDelete(id, (err, upload)=>{
        if(err) throw err;
        //Then we get the image directory from the document which is available on upload
        fs.unlink(upload.filePath, (err)=>{
            if(err) throw err;
            //After a success we do a redirect to the home page
            res.redirect('/')
        } )
    })
})

//Server
app.listen(3000, ()=> console.log('Server started on port 3000'));


// http://expressjs.com/en/resources/middleware/multer.html
// https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088