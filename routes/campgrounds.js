const express= require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');

//cloudinary
const {storage} = require('../cloudinary/index');
const upload = multer({storage});


// Middleware
const {isLoggedIn, isAuthor, validateCampground}= require('../middleware');

// Refactoring routes //
//Create new campground
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    
// Create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.viewCampground)) /* /campground/:id may incorrectly get /campground/something, treating 'something' as an id, make sure id is below these query formats  */
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //update campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //delete campground


// Edit page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;