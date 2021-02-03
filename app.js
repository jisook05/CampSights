
// If running in dev mode we require dotenv. dotenv variable will be
// added to node env  
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



// Requirements for Basic Express App
const express = require('express');
const app = express();
const path = require('path');
// Session
const session = require('express-session');
// Flash
const flash = require('connect-flash');
//ejs mate
const ejsMate = require('ejs-mate');
//Error handlers
const ExpressError = require('./utils/ExpressError');
// Method override
const methodOverride = require('method-override');
// Routers
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
// Pssport
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
//Mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
//Mongo session
const MongoDBStore = require('connect-mongo')(session);

const dbUrl = process.env.DB_URL;

/*_____________________________________________________________________*/

// Connect Mongoose
const mongoose = require('mongoose');
const { MongoStore } = require('connect-mongo');
// 'mongodb://localhost:27017/camp-sight'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("DB Connected");
})

app.engine('ejs', ejsMate);

// Join view path 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

// Allow it to serve public folder
app.use(express.static(path.join(__dirname, 'public')));

//sanitize 
app.use(mongoSanitize());

/*_____________________________________________________________________*/

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60 //(in secs) dont want to resave all session on db every time page refresh, lazy update
})

store.on('error', function(e){
    console.log('session store error', e)
})

// Session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUnitialized: true,
    cookie: {
        //Security measures
        httpOnly: true,
        // secure: true,
        // When do we want the cookie to expire
        expires: Date.now() + 1000 *60 *60*24*7,
        maxAge: 1000 *60 *60*24*7
    }
}

app.use(session(sessionConfig)); // this line must exist before passport session
app.use(flash());

/*________________________________________________________________________________________ */

app.use(helmet()); //helmet CSP -only acceptable sources are allowed to load 
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfonrynhp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

/*________________________________________________________________________________________ */


app.use(passport.initialize());
app.use(passport.session());   // Passport session if we want persistent login sessions 
passport.use(new LocalStrategy(User.authenticate())); //we would like to use local strat

passport.serializeUser(User.serializeUser()); // how to store user in session
passport.deserializeUser(User.deserializeUser()); // unstore it 

/*_____________________________________________________________________*/


// Flash middleware, available to every single request
app.use((req,res,next)=>{
   
    res.locals.currentUser = req.user;
    res.locals.success= req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/*_____________________________________________________________________*/


//router middleware
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req,res)=>{
    res.render('home');
})

// Only runs when all other path does not work 
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404));
});

// Error handler
app.use((err, req, res, next)=>{
  
    const {statusCode= 500} = err;
    if(!err.message) err.message='Oh no, something went wrong'
    res.status(statusCode).render('error', {err});
   
});

/*_________________________________________________________________*/

const port = process.env.PORT || 3000; //port available on heroku (usually 80)

// PORT connection 
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`)
});