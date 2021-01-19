var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const {logger} = require('../../utils');
const Tournament = require('../../models/Tournament')

router.post('/create', (req, res) => {
    const {money_award, gold_award, day, money_price, gold_price} = req.body

    let today = new Date()
    today.setDate(today.getDate() + Number(day));
    let end_date = today;

    new Tournament({
        end_date,
        money_award,
        gold_award,
        money_price,
        gold_price
    }).save((err) => {
        if (err)
            logger.log(err)
        else {
            res.json({
                code: 200,
                message: "Turnuva oluşturuldu"
            })
        }
    })
})

router.get('/get', (req, res) => {

    let today = new Date()

    Tournament.aggregate([
        {
            $match: {
                $and: [{start_date: {$lt: today}}, {end_date: {$gt: today}}]
            }
        }
    ], (err, info) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        }
            res.json(info)
    })
});

module.exports = router