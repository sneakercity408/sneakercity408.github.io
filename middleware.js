module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        
        req.flash('error', 'You must be signed in to add a shoe!');
        return res.redirect('/sneakers/login');
    }
    next();
}