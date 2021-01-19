var express = require('express');
var router = express.Router();
const {logger} = require('../../utils');
const Words = require('../../models/Words')

router.post('/add', (req, res) => {
    const {word, length} = req.body;
    new Words({
        word
    }).save().then((data) => {
        res.json(data)
    })
});

router.post('/edit', (req, res) => {
    const {word, length,_id} = req.body;

    Words.updateOne({_id},{word}).exec((err) =>
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

    Words.deleteOne({_id}).exec((err) =>
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
    Words.find((err, words) =>
    {
        if(err)
        {
            logger.error(err)
            throw err;
        }

        res.json(words)
    })
});

module.exports = router