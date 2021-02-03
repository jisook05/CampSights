const User = require('../models/user');
const passport = require('passport');

module.exports.createUser = async (req,res)=>{

    try{
        //Register route logic
        const {email, username, password}=req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); //pw will be hashed with salt 
        
        // We want to make login session after registration
        req.login(registeredUser, err => {
            if(err) return next(err); // this will hit err hadnler
            req.flash('success',"Welcome to CampSights!");
            res.redirect('/campgrounds')
        });   
    } catch(e){
        console.log(e.message);
        req.flash('error', e.message);
        res.redirect('register');
    }
    
}


module.exports.loginUser =  (req, res)=>{
    //pp has authenticate method where we auth local accounts, later we can also auth google or twitter
     req.flash('success', 'welcome back!');
     const redirectUrl= req.session.returnTo || '/campgrounds';
     
     //delte returnTo object
     delete req.session.returnTo;
     res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout();
    req.flash('success', 'You have been logged out')
    res.redirect('/');
}