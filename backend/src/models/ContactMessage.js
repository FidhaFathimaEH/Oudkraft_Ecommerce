const mongoose = require('mongoose');
// TODO: Define ContactMessage fields and indexes in Sprint 2.
module.exports = mongoose.model('ContactMessage', new mongoose.Schema({}, { timestamps: true, strict: false }));
