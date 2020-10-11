const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ScoreSchema = new Schema ({
    mod_id: Schema.Types.ObjectId,
    user_id: Schema.Types.ObjectId,
    race_id: Schema.Types.ObjectId,
    date: {
        type: Date,
        default: Date.now
    },
    true_answer:{
        type: Number
    },
    false_answer:{
        type: Number
    },
    score:{
        type: Number
    }
},{ collection: 'Scores' })

module.exports=mongoose.model('Scores',ScoreSchema);