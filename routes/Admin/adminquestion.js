var express = require('express');
var router = express.Router();
const {logger} = require('../../utils');
const Question = require('../../models/Questions')
const Words = require('../../models/Words')

router.post('/add', (req, res) => {
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

router.post('/edit', (req, res) => {
    const {question, answerA, answerB, answerC, answerD, correct_answer,_id} = req.body;

    Question.updateOne({_id},{question, answerA, answerB, answerC, answerD, correct_answer}).exec((err) =>
    {
        if(err)
        {
            logger.error(err)
            throw err;
        }

        res.json({
            code: 200
        })
    })
});

router.post('/delete', (req, res) => {
    const {_id} = req.body;

    Question.deleteOne({_id}).exec((err) =>
    {
        if(err)
        {
            logger.error(err)
            throw err;
        }

        res.json({
            code: 200
        })
    })
});

router.get('/get', (req, res) => {
    Question.find((err, questions) =>
    {
        if(err)
        {
            logger.error(err)
            throw err;
        }

        res.json(questions)
    })
});

module.exports = router

