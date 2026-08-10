const mongoose = require('mongoose');
// TODO: Define Address fields and indexes in Sprint 2.
module.exports = mongoose.model('Address', new mongoose.Schema({}, { timestamps: true, strict: false }));
