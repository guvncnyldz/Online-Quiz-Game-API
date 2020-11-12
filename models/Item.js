const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ItemSchema = new Schema ({
    race: Number,
    photo: {
        type: String,
    },
    item_name:{
        type: String,
        required: true
    },
    coin_cost:{
        type: Number,
        default: 0
    },
    money_cost:{
        type: Number,
        default: 0
    },
    store:{
        type: Boolean,
        default: true
    },
    type:{
        type: Number,
        default:0
    }, /* 0: Baş, 1: Gövde, 2: Sağ El, 3: Sol El, 4: Bacak, 5: Ayak, 6: Aksesuar */
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Items' })

module.exports=mongoose.model('Items',ItemSchema);