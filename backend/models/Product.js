const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }, // e.g. "Spark Plugs", "Ignition Coils"
  carBrand: { type: String, required: true }, // e.g. "Toyota", "Nissan"
  carModel: { type: String, default: '' },    // e.g. "Corolla", "Note"
  year: { type: String, default: '' },        // e.g. "2008-2015"
  images: [{ type: String }],                 // array of image URLs
  video: { type: String, default: null },     // optional video URL
  stock: { type: Number, default: 1 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);