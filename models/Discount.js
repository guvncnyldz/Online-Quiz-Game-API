const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const DiscountSchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    product_id: Schema.Types.ObjectId,
    rate:{
        type: Number,
        default: 0
    },
    type:{ // 0: Item, 1: Joker
        type: Number,
        default: 0
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Discount' })

module.exports=mongoose.model('Discount',DiscountSchema);