var express = require('express');
var router = express.Router();
const {logger} = require('../utils');
const Question = require('../models/Questions')
const Words = require('../models/Words')


/* Soru Ekle */
router.post('/addQuestion', (req, res) => {
    const {question, answerA, answerB, answerC, answerD, correct_answer} = req.body;
    new Question({
        question,
        answerA,
        answerB,
        answerC,
        answerD,
        correct_answer
    }).save().then((data) => {
        res.json(data)
    })
});

router.post('/getQuestion', (req, res) => {
    let count = 1;

    if (req.body.count) {
        count = req.body.count;
    } else {
        count = 1;
    }

    Question.countDocuments((err, question_count) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);

        let successCount = 0;
        let questions = []

        for (i = 0; i < count; i++) {
            let random = Math.floor(Math.random() * question_count)
            Question.findOne((err, question) => {
                if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
                else if (question) {
                    questions.push(question);
                    successCount++;
                    if (successCount == count) {
                        res.json(questions);
                    }
                }
            }).skip(random).select("-true_answer -false_answer");
        }
    })
});

/* Kelime Ekle */
router.post('/addWord', (req, res) => {
    const {word, length} = req.body;
    new Words({
        word
    }).save().then((data) => {
        res.json(data)
    })

});

/* Soru İstatistiğini Güncelle */
router.put('/answer', (req, res) => {
    const {is_correct, question_id} = req.body;
    let updateData = {}

    is_correct == 1 ? updateData.average = +1 : updateData.average = -1
    Question.findByIdAndUpdate(question_id, {$inc: updateData}).then(() => {
        res.json({
            code: 200,
            message: "Soru istatistiği başarı ile güncellendi"
        })
    })
});

module.exports = router

