const mongoose = require('mongoose');
// TODO: Define OrderItem fields and indexes in Sprint 2.
module.exports = mongoose.model('OrderItem', new mongoose.Schema({}, { timestamps: true, strict: false }));
