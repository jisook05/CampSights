const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// Define user schema
const UserSchema = new Schema({
    email: {
        type: String,
        required:true,
        unique: true
    }
});

// this will add on to our schema, a field for passport 
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);