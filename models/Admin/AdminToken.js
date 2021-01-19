const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const AdminTokenSchema = new Schema ({
    user_name: String,
    token:{
        type: String,
    }
},{ collection: 'AdminToken' })

module.exports=mongoose.model('AdminToken',AdminTokenSchema);