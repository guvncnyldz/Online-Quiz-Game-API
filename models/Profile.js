const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ProfileSchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    photo: {
        type: String,
    },
    coin:{
        type: Number,
        default: 0
    },
    money:{
        type: Number,
        default: 0
    },
    energy:{
        type: Number,
        default: 0
    },
    badges:[],
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Profile' })

module.exports=mongoose.model('Profile',ProfileSchema);