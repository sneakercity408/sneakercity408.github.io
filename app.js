if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
console.log(process.env.SECRET)
const express = require('express');
var ejs = require('ejs');
const app = express();
var path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const cookieParser = require("cookie-parser");
var livereload = require("connect-livereload");
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
const ejsMate = require('ejs-mate');

const Shoes = require('./models/shoesdb');
const res = require('express/lib/response');

const sneakers = require('./routes/sneakers');

mongoose.connect('mongodb+srv://kendricklam:sneakerbro@cluster0.bjmly.mongodb.net/?retryWrites=true&w=majority', {

    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser()); 

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionConfig));
app.use(flash());




app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   console.log(req.session.returnTo);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use('/sneakers', sneakers);

app.get("/", function (req, res) {
    res.render("sneakers/home");
});

app.all('*', function (req, res, next) {
    next(new ExpressError('Page Not Found', 404));
});

app.use(function (err, req, res, next) {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).send(message);
});

app.listen(3000, function () {
    console.log("server is listening!!!");
});