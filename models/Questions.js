const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const QuestionShema = new Schema ({
    question:{
        type: String,
        required: true
    },
    answerA: {type: String, required: true},
    answerB: {type: String, required: true},
    answerC: {type: String, required: true},
    answerD: {type: String, required: true},
    correct_answer: {type: Number, required: true},
    true_answer:{
        type: Number,
        default: 0
    },
    false_answer:{
        type: Number,
        default: 0
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Questions' })

module.exports=mongoose.model('Questions',QuestionShema);