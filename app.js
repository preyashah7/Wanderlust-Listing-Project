if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpresssError = require("./utils/ExpressError.js");
const listings = require("./routes/listings.js");
const reviews = require("./routes/reviews.js");
const users = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const dbUrl = process.env.ATLASDB_URL;
main()
.then(() => {
    console.log("connected succesfully");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// const store = MongoStore.create({
//     mongoUrl: dbUrl ,
//     crypto: {
//         secret: process.env.SECRET
//     },
//     touchAfter : 24 * 3600
    
// });

// store.on("error" , () => {
//     console.log("Some Error In Mongo Session Store" , err)
// })

const sessionOptions = {
    // store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true
     }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname , "/public")));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);


app.use((req , res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings" , listings);
app.use("/listings/:id/reviews" , reviews);
app.use("/" , users);



app.all("*" ,  (req , res , next) => {
    next(new ExpresssError(404 ,  "Page not found"));
})

app.use((err , req , res , next) => {
   let {status= 500, message = "something went wrong"} = err;
   res.status(status).render("error.ejs" , {message});
})

app.listen(port , () => {
    console.log(`App is listening on port : ${port}`);
})