const mongoose = require('mongoose');
const Schema=mongoose.Schema;
let d = new Date();
let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
const InvoicesSchema = new Schema ({
    user_id: Schema.Types.ObjectId,
    product_id: Schema.Types.ObjectId,
    price: {
        type: Number,
        default: 0
    },
    price_type:{
        type: Number, //0: coin, 1:money
        default: 0
    },
    date: {
        type: Date,
        default: date,
    },
    type: {
        type: Number, //0: item, 1:joker
        default: 0 
    },
    is_visible:{
        type: Boolean,
        default: true
    }

},{ collection: 'Invoices' })

module.exports=mongoose.model('Invoices',InvoicesSchema);