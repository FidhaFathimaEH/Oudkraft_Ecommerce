const mongoose = require('mongoose');
// TODO: Define Order fields and indexes in Sprint 2.
module.exports = mongoose.model('Order', new mongoose.Schema({}, { timestamps: true, strict: false }));
