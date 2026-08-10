const mongoose = require('mongoose');
// TODO: Define Category fields and indexes in Sprint 2.
module.exports = mongoose.model('Category', new mongoose.Schema({}, { timestamps: true, strict: false }));
