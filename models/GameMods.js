const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const GameModesSchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'GameMods' })

module.exports=mongoose.model('GameMods',GameModesSchema);