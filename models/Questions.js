const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const QuestionShema = new Schema ({
    question:{
        type: String,
        required: true
    },
    answers:[{
        answer: {
            type: String,
            required: true
        },
        is_correct:{
            type: Boolean,
            default: false
        }
    }],
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