const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const WordSchema = new Schema ({
    word:{
        type: String,
        required: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Words' })

module.exports=mongoose.model('Words',WordSchema);