const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const JokerSchema = new Schema ({
    photo: {
        type: String,
    },
    name:{
        type: String,
        required: true
    },
    coin_cost:{
        type: Number,
        default: 0
    },
    money_cost:{
        type: Number,
        default: 0
    },
    store:{
        type: Boolean,
        default: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Jokers' })

module.exports=mongoose.model('Jokers',JokerSchema);