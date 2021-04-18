const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const InventorySchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    sprite_id:{
        type: String,
        default: false
    },
    name:{
        type: String,
        default: false
    },
    type:{
        type: String,
        default: false
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Inventory' })

module.exports=mongoose.model('Inventory',InventorySchema);