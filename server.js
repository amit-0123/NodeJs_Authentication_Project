import express from 'express'
import mongoose from 'mongoose'
import { User } from './models/User.js'
import path from 'path'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: 'dwxzpnygh', 
    api_key: '858881598963537', 
    api_secret: 'Lwq34ji6iQ_k6BwEfIh-1z82mps' // Click 'View API Keys' above to copy your API secret
});

const app = express();

app.use(express.urlencoded ({extended:true}) )

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    },
  })
  
  const upload = multer({ storage: storage })

// show register page
app.get('/register',(req,res)=>{
    res.render("register.ejs")
})

// create user
app.post('/register',upload.single('file'),async(req,res)=>{
    try {
        const file = req.file.path;
        const { name, email, password } = req.body;

        // if (!file || !name || !email || !password) {
        //     return res.status(400).send('All fields are required');
        // }
        

        const cloudinaryRes = await cloudinary.uploader.upload(file, {
            folder: 'NodeJs_Authentication_App',
        });

        let user = await User.create({
            profileImg:cloudinaryRes.secure_url,
            name,email,password
        })

        res.redirect('/');

        console.log(cloudinaryRes, name, email, password);
        // Proceed with saving the user to the database or further processing
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Internal Server Error');
    }
});


// login user
app.post("/login",async (req,res)=>{
      const {email,password} = req.body
      try {
        let user = await User.findOne({email})
        console.log("user detail",user)
        if(!user) res.render("login.ejs",{msg:"User Not Found"})
            else if(user.password!=password) res.render("login.ejs",{msg:"Invalid Password"})
        else{
    res.render("profile.ejs",{user})}
      } catch (error) {
        res.send("error Occurred")
      }
})

// get all users
app.get('/users',async (req,res)=>{
    let users = await User.find().sort({createdAt:-1});
    res.render("users.ejs",{users});
});



// show login page
app.get('/',(req,res)=>{
    res.render("login.ejs")
})



mongoose.connect(
    "mongodb+srv://yadavamit34996:OMHD8yAcfSBdUZQt@cluster0.5m52s.mongodb.net/",
    {
        dbName: "NodeJs_Express_API_Series"
    }
).then(()=>console.log("Mongodb Connected Successfully")).catch((error)=>console.log(error));


const port = 3000;

app.listen(port,()=>console.log(`Your server is running on the port ${port}`))