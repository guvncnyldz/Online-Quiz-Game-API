var express = require('express');
var router = express.Router();
const Items = require('../models/Item');
const Jokers = require('../models/Joker');
const Profile = require('../models/Profile')
const Inventory = require('../models/Inventory')
const UserJoker = require('../models/UserJoker')
const Invoices = require('../models/Invoices')
const mongoose = require('mongoose')
const {logger} = require('../utils');

router.post('/addCosmetic', (req, res) => {
    const {item_name, sprite_name, gold_cost, money_cost, type} = req.body
    new Items({
        item_name,
        sprite_name,
        gold_cost,
        money_cost,
        type
    }).save((err) => {
        if (err) {
            logger.error(err)
        } else
            res.json({
                code: 200,
                message: "Ürün Eklendi"
            })
    })
})

router.post('/getCosmetic', (req, res) => {
    Items.find({}, (err, items) => {
        if (err) logger.error(err);
        else if (items.length > 0) {
            res.json(items)
        }
    });
})


module.exports = router;