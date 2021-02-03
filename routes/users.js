const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get((req, res)=>{ res.render('users/register.ejs')})
    .post( catchAsync(users.createUser));

router.route('/login')
    .get((req,res)=>{ res.render('users/login.ejs');})
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser);

router.get('/logout', users.logout);

module.exports = router;