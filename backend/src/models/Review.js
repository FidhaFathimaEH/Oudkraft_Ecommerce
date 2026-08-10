const mongoose = require('mongoose');
// TODO: Define Review fields and indexes in Sprint 2.
module.exports = mongoose.model('Review', new mongoose.Schema({}, { timestamps: true, strict: false }));
