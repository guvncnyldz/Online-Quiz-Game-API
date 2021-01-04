var express = require('express');
var router = express.Router();
const {logger} = require('../utils');
const Words = require('../models/Words')


router.post('/getWord', (req, res) => {
    let count = 1;

    if (req.body.count) {
        count = req.body.count;
    } else {
        count = 1;
    }

    Words.countDocuments((err, word_count) => {
        if (err) logger.log(err);

        let successCount = 0;
        let words = []
        let randoms = []

        for (i = 0; i < count; i++) {
            let random = 0;
            let flag = false;
            let tryCount = 0;
            do {
                tryCount++;
                flag = false;
                random = Math.floor(Math.random() * word_count)
                randoms.forEach(chosen_random => {
                    if (chosen_random == random)
                    {
                        flag = true;
                    }
                })

                if(tryCount >= 1000)
                    flag = false;

            } while (flag)

            randoms.push(random)

            Words.findOne((err, word) => {
                if (err) logger.log(err);
                else if (word) {
                    words.push(word)
                    successCount++;
                    if(successCount == count)
                    {
                        res.json(words)
                    }
                }
            }).skip(random);
        }

    })
});


router.post('/addWord', (req, res) => {
    const {word, length} = req.body;
    new Words({
        word
    }).save().then((data) => {
        res.json(data)
    })

});

module.exports = router;
