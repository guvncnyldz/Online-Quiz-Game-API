const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ScoreSchema = new Schema ({
    profile_id: Schema.Types.ObjectId,
    user_id: Schema.Types.ObjectId,
    mod_id: Number,
    race: Number,
    date: {
        type: Date,
        default: Date.now
    },
    true_answer:{
        type: Number
    },
    earn:{
        type: Number
    },
    win: {
        type: Boolean
    }
},{ collection: 'Scores' })

module.exports=mongoose.model('Scores',ScoreSchema);