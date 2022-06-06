const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');
const Schema = mongoose.Schema;




const shoeSchema = new Schema({
    name: String,
    size: String,
    price: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    location: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    description: String,
    brand: String,
    author : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
   
});

module.exports = mongoose.model('Shoes', shoeSchema);