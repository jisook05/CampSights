// Connect Mongoose
const mongoose = require('mongoose');
// Require campground schema
const Campground = require('../models/campground');

//Other requirements
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
 
mongoose.connect('mongodb://localhost:27017/camp-sight', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("DB Connected");
});

// To pick a random array
const sample = array => array[Math.floor(Math.random()* array.length)];


// Make campgrounds using seed files
const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0; i<20;i++){
        //Use random number to pick a city
        const random = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20+10);
        
        const camp = new Campground({
            author:"6014de03293be13e94b6533d",
            location:`${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
              type: "Point",
              coordinates: [cities[random].longitude,
                            cities[random].latitude]
            },
            images: 
            [
                {
    
                  url: 'https://res.cloudinary.com/dfonrynhp/image/upload/v1612245281/CampSights/scott-goodwill-y8Ngwq34_Ak-unsplash_j6lefp.jpg',
                  filename: 'CampSights/scott-goodwill-y8Ngwq34_Ak-unsplash_j6lefp'
                },
                {
                  url: 'https://res.cloudinary.com/dfonrynhp/image/upload/v1612246312/CampSights/jimmy-conover-J_XuXX9m0KM-unsplash_yfezqc.jpg',
                  filename: 'CampSights/jimmy-conover-J_XuXX9m0KM-unsplash_yfezqc'
                }
              
              ],
            price
        });

        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
}) 