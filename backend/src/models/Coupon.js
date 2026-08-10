const mongoose = require('mongoose');
// TODO: Define Coupon fields and indexes in Sprint 2.
module.exports = mongoose.model('Coupon', new mongoose.Schema({}, { timestamps: true, strict: false }));
