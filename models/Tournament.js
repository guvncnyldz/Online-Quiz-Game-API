const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TournamentSchema = new Schema({
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
    },
    money_award: {
        type: Number,
        default: 0
    },
    gold_award: {
        type: Number,
        default: 0
    },
    money_price: {
        type: Number,
        default: 0
    },
    gold_price: {
        type: Number,
        default: 0
    },
    is_visible: {
        type: Boolean,
        default: true
    }
}, {collection: 'Tournament'})

module.exports = mongoose.model('Tournament', TournamentSchema);