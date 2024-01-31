const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: false
    },
    itemUrl: {
        type: String,
        required: true
    },
    postedOn: {
        type: Date,
        required: true
    },
    upvotesCount: {
        type: Number,
        required: true
    },
    commentsCount: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    timeposted: {
        type: Number,
        required: true
    },
    // deletedByUsers: {
    //     type: Set,
    //     default: []
    // }
    deletedByUsers: {
        type: [String], // Use array instead of Set
        default: []
    }

});

const News = mongoose.model('News', newsSchema);

module.exports = News;