const mongoose = require('mongoose');
// TODO: Define Cart fields and indexes in Sprint 2.
module.exports = mongoose.model('Cart', new mongoose.Schema({}, { timestamps: true, strict: false }));
