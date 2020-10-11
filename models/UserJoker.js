const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const UserJokerSchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    joker_id: Schema.Types.ObjectId,
    count:{
        type: Number,
        default: 0
    },
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'UserJoker' })

module.exports=mongoose.model('UserJokers',UserJokerSchema);