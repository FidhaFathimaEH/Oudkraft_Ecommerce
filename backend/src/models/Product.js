const mongoose = require('mongoose');
// TODO: Define Product fields and indexes in Sprint 2.
module.exports = mongoose.model('Product', new mongoose.Schema({}, { timestamps: true, strict: false }));
