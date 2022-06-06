const express = require('express');
const router = express.Router();
const Shoes = require('../models/shoesdb');
const User = require('../models/user');
const passport = require('passport');
const flash = require('connect-flash');
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');
const { shoeSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware.js');
const multer = require('multer');
const {storage} = require ('../cloudinary');
const upload = multer({ storage});
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});



const validateShoes = (req, res, next) => {
    const { error } = shoeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

router.get("/", async function (req, res) {
   
    const shoess = await Shoes.find({});
    res.render("sneakers/index", { shoess });
    console.log('hi');
});
router.get("/new", ensureLoggedIn('login'), async function (req, res) {
    res.render("sneakers/new", { user: req.user });
    console.log('new');


});




router.get("/test1", async function (req, res) {
   
    res.render("sneakers/description");
    console.log('testing');
});

router.post('/new',upload.array('image'), validateShoes, catchAsync(async function (req, res, next) {
    // router.post('/new', upload.array('image'), catchAsync(async function (req, res, next) {
    req.flash('success', 'Successfully added shoe!');
    const geoData = await geocoder.forwardGeocode({
        query: req.body.shoes.location,
        limit: 1

    }).send()
 
     const shoess = new Shoes(req.body.shoes);
     shoess.images = req.files.map(f => ({url: f.path, filename: f.filename}));
     shoess.author = req.user._id;
     shoess.geometry = geoData.body.features[0].geometry;
     await shoess.save();
     console.log(shoess)

     res.redirect('/sneakers');
   
}));


router.get('/login', function (req, res) {
    
    res.render('sneakers/login2');
    
    console.log('login')
});
router.get('/Nike', async function (req, res) {
    const shoess = await Shoes.find({brand: 'Nike'}).exec();
    res.render('sneakers/Nike', { shoess });
    
    console.log('test')
});

router.get('/Jordan', async function (req, res) {
    const shoess = await Shoes.find({brand: 'Jordan'}).exec();
    res.render('sneakers/Jordan', { shoess });
    
    console.log('test')
});
router.get('/Other', async function (req, res) {
    const shoess = await Shoes.find({brand: 'Other'}).exec();
    res.render('sneakers/Other', { shoess });
    
    console.log('test')
});

router.post('/login',passport.authenticate('local', { failureFlash: true, successReturnToOrRedirect: '/sneakers', failureRedirect: 'login' }));


router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/sneakers');
});

router.get('/registration', function (req, res) {
    res.render('sneakers/registration');
    console.log('login');
});
router.post('/registration', catchAsync( async function (req, res) {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to SneakerCity');
            console.log(registeredUser);
            console.log(req.session);
            res.redirect(`/sneakers`);

        });
    }
    catch (e){
        req.flash('error', e.message);
        res.redirect('/sneakers/registration');
    }
   
}));
router.get('/:id', async function (req, res) {
    const shoess = await Shoes.findById(req.params.id).populate('author');
    console.log(shoess);
    res.render('sneakers/show', { shoess });
});
router.get('/:id/edit', async function (req, res) {
    const shoess = await Shoes.findById(req.params.id);
    
   res.render('sneakers/edit', { shoess });
});

router.put('/:id', upload.array('image'), async function (req, res) {
    const {id } = req.params;
    const shoess = await Shoes.findByIdAndUpdate(id, {...req.body.shoes}) ;
   const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    shoess.images.push(...imgs);
    console.log(shoess.images);
    await shoess.save();
    res.redirect(`/sneakers/${shoess._id}`);
})
router.delete('/:id', async function (req, res) {
    const { id } = req.params;
    await Shoes.findByIdAndDelete(id);
    res.redirect('/sneakers');
});


module.exports = router;