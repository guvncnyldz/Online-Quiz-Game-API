var express = require('express');
var router = express.Router();
const Inventory = require('../models/Inventory');
const Profile = require('../models/Profile');
const mongoose = require('mongoose')
const {logger} = require('../utils');

router.put('/updatecosmetic', (req, res) => {
    const {pid, head, body, hand, foot, eye, hair} = req.body;

    let updateCosmetic =
        {
            head: head, body, hand, foot, eye, hair
        }
    Profile.updateOne({_id: pid}, {cosmetic: updateCosmetic}, (err) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        else {
            res.json({
                code: 200,
                message: "Kozmetikler başarıyla güncellendi"
            })
        }
    })
});

router.post('/getinventory', (req, res) => {
    const {user_id} = req.body

    Inventory.find({user_id}, (err, inventory) => {
        if (err) logger.error(err)
        else {
            res.json(inventory)
        }
    }).select("-_id -user_id")
})

router.post('/addinventory', (req, res) => {
    const {user_id,sprite_name,type,name} = req.body
    new Inventory({
        user_id,
        sprite_name,
        type,
        name
    }).save((err) => {
        if(err) logger.log(err)
        else
            res.json({
                code: 200,
                message: "Ekleme Başarılı"
            })
    })
})

module.exports = router;