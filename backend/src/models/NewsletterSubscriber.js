const mongoose = require('mongoose');
// TODO: Define NewsletterSubscriber fields and indexes in Sprint 2.
module.exports = mongoose.model('NewsletterSubscriber', new mongoose.Schema({}, { timestamps: true, strict: false }));
