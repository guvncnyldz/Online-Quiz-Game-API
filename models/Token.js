const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const TokenSchema = new Schema ({
    user_id: String,
    token:{
        type: String,
    }
},{ collection: 'Token' })

module.exports=mongoose.model('Token',TokenSchema);