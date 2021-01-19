var express = require('express');
var router = express.Router();
const {logger} = require('../../utils');
const Items = require('../../models/Item')

router.post('/add', (req, res) => {
    const {item_name, sprite_name, gold_cost, money_cost, type} = req.body

    new Items({
        item_name,
        sprite_name,
        gold_cost,
        money_cost,
        type
    }).save((err,doc) => {
        if (err) {
            logger.error(err)
        } else
            res.json(doc)
    });
})


router.post('/edit', (req, res) => {
    const {item_name, sprite_name, gold_cost, money_cost, type,_id} = req.body

    Items.updateOne({_id},{item_name, sprite_name, gold_cost, money_cost, type}).exec((err,doc) =>
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

    Items.deleteOne({_id}).exec((err) =>
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
    Items.find((err, items) =>
    {
        if(err)
        {
            logger.error(err)
            throw err;
        }

        res.json(items)
    })
});


module.exports = router