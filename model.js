const mongoose = require('mongoose');


const scrapedModel = mongoose.model('scrapedModel', mongoose.Schema({
    title: String,
    str: String,
    url: String,
}));

module.exports = scrapedModel;
