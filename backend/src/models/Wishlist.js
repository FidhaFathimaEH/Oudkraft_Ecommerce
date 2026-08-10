const mongoose = require('mongoose');
// TODO: Define Wishlist fields and indexes in Sprint 2.
module.exports = mongoose.model('Wishlist', new mongoose.Schema({}, { timestamps: true, strict: false }));
