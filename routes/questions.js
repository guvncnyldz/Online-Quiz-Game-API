var express = require('express');
var router = express.Router();
const { logger} = require('../utils');
const Questions = require('../models/Questions')
const Words = require('../models/Words')


/* Soru Ekle */
router.post('/addQuestion', (req, res) =>{
    const {question, answers} = req.body;
    new Questions({
        question,
        answers
    }).save().then((data) => {
        res.json(data)
    })
   
});

/* Kelime Ekle */
router.post('/addWord', (req, res) =>{
    const {word } = req.body;
    new Words({
        word
    }).save().then((data) => {
        res.json(data)
    })
   
});

/* Soru İstatistiğini Güncelle */
router.put('/statistic/:uid', (req, res) =>{
    const { state } = req.body;
    let updateData = {}
    state == true ? updateData.true_answer = +1 : updateData.false_answer= +1
    Questions.findByIdAndUpdate(req.params.uid,{$inc: updateData}).then(() => {
        res.json({
            status: true,
            message: "Soru istatistiği başarı ile güncellendi"
        })
    })
   
});

module.exports = router;
