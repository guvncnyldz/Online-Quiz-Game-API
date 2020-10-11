const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const RaceSchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Race' })

module.exports=mongoose.model('Race',RaceSchema);