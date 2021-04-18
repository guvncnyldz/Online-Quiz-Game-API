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
        default: 20
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
            default: "head_default"

        },
        body: {
            type: String,
            default: "body_default"

        },
        foot: {
            type: String,
            default: "foot_default"

        },
        hand: {
            type: String,
            default: "hand_default"

        },
        hair: {
            type: String,
            default: "hair_default"

        },
        eye: {
            type: String,
            default: "eye_default"
        },
    },
    badges:[],
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Profile' })

module.exports=mongoose.model('Profile',ProfileSchema);