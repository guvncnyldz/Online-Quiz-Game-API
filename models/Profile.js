const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ProfileSchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    user_name: {
        type: String,
    },
    race: {type: Number,default: -1},
    coin:{
        type: Number,
        default: 100
    },
    money:{
        type: Number,
        default: 0
    },
    energy:{
        type: Number,
        default: 0
    },
    joker: {
        pass:{
            type: Number,
            default: 10
        },
        correct:{
            type: Number,
            default: 10
        },
        bomb:{
            type: Number,
            default: 10
        },
    },
    cosmetic: {
        head: {
            type: String,
            default: "default"

        },
        body: {
            type: String,
            default: "default"

        },
        foot: {
            type: String,
            default: "default"

        },
        hand: {
            type: String,
            default: "default"

        },
        hair: {
            type: String,
            default: "default"

        },
        eye: {
            type: String,
            default: "default"
        },
    },
    badges:[],
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Profile' })

module.exports=mongoose.model('Profile',ProfileSchema);