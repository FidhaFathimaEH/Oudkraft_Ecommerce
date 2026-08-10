const mongoose = require('mongoose');
// TODO: Define GiftOrder fields and indexes in Sprint 2.
module.exports = mongoose.model('GiftOrder', new mongoose.Schema({}, { timestamps: true, strict: false }));
