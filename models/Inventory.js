const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const InventorySchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    item_id: Schema.Types.ObjectId,
    count: {
        type: Number,
        default: 0
    },
    active:{
        type: Boolean,
        default: false
    },
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Inventory' })

module.exports=mongoose.model('Inventory',InventorySchema);