const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const UserSchema = new Schema ({
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    e_mail:{
        type: String
    },
    device_id:{
        type: String
    },
    is_login:{
        type: Boolean,
        default: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'User' })

module.exports=mongoose.model('User',UserSchema);