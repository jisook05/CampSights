const express= require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');

// Catch Errors
const catchAsync = require('../utils/catchAsync');

//Schema Requirements 
const Review = require('../models/review');
const Campground = require('../models/campground');

//Middleware
const {isReviewAuthor, validateReview, isLoggedIn}= require('../middleware');


// Adding a review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.addReview));

// Deleting a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;