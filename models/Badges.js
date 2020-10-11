const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const BadgesSchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Badges' })

module.exports=mongoose.model('Badges',BadgesSchema);