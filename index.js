import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017", {
    dbName: "Backend",
})
.then(()=>console.log("Database connected"))
.catch((e) => console.log(e.message));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
//use of middleware to get body data from from
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

//should be written as it is, setting up the engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
    const {token} = req.cookies;

    if(token){
        const decoded = jwt.verify(token, "asdfghjkl");
        req.user = await User.findById(decoded.id);
        next();
    }else{
        res.render("login");
    }
}

app.get("/login", isAuthenticated, (req,res) => {
    console.log(req.user);
    res.render("logout");
})

app.get("/register", (req,res) => {
    // console.log(req.user);
    res.render("register");
})

app.post("/register", async (req, res)=>{
    //created user
    const {name, email, password} = req.body; 

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({name, email, password: hashPassword});

    const token = jwt.sign({id: user._id}, "asdfghjkl");
    console.log(token);

    //sending user is as token
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/login");
})

app.post("/login", async (req, res)=>{
    //created user
    const {email, password} = req.body;

    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }

    const isalreadyAUser = await bcrypt.compare(password, user.password);

    if(!isalreadyAUser){
        return res.render("login", {email, message: "Incorrect password"})
    }

    // user = await User.create({email, password});

    const token = jwt.sign({id: user._id}, "asdfghjkl");
    console.log(token);

    //sending user is as token
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/login");
})

app.get("/logout", (req, res)=>{
    res.cookie("token", "null", {
        httpOnly: true, expires: new Date(Date.now())
    });
    res.redirect("/login");
})


app.get("/", (req,res) => {
  res.render("index");
})


app.listen(3000, () => {
    console.log("Server is working!");
})










// app.get("/add", async (req,res) => {

//     await Message.create({email: "Sam2", password: "abcHello456"})
//     res.send("You will see your messages here!");
    
//   })

// app.post("/", async (req, res) => {
//     // console.log(req.body);
//     // const userData = {email: req.body.email, password: req.body.password};
//     // console.log(userData);
//     const {email, password} = req.body;
//     await Message.create({email, password})
//     res.render("success");
// })

// app.get("/users", (req, res) => {
//     res.json({users,})
// })