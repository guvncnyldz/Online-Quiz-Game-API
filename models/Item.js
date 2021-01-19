const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    race: Number,
    item_name: {
        type: String,
        required: true
    },
    sprite_name: {
        type: String,
        required: true
    },
    gold_cost: {
        type: Number,
        default: 0
    },
    money_cost: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: 0
    },
    is_visible: {
        type: Boolean,
        default: true
    }
}, {collection: 'Items'})

module.exports = mongoose.model('Items', ItemSchema);