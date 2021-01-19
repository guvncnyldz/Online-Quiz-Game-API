var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const Scores = require('../models/Scores')
const {logger} = require('../utils');

router.put('/savescore', (req, res) => {
    const {mod_id, profile_id, user_id, race, true_answer, earn, win} = req.body;

    winBoolean = win == 1

    new Scores({
        mod_id,profile_id,user_id,race,true_answer,earn,win: winBoolean
    }).save((err) => {
        if(err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
    });

    res.json({
        code: 200,
        message: "Skor kaydedildi"
    })
});

router.post('/ranking', (req, res) => {
    const {mod_id, race, type} = req.body;
    endDate = new Date();

    switch (type) {
        case "daily":
            endDate.setDate(endDate.getDate()-1)
            break;
        case "weekly":
            endDate.setDate(endDate.getDate()-7)
            break;
        case "monthly":
            endDate.setDate(endDate.getDate()-30)
            break;
        case "yearly":
            endDate.setDate(endDate.getDate()-365)
            break;
        default: console.log()
    }

    let matchParam = {}
    if (mod_id)
        matchParam.mod_id = Number(mod_id)
    if (race && race != "-1")
        matchParam.race = Number(race)

    matchParam.date = {$gt: endDate, $lt: new Date()}
    Scores.aggregate([
        {
            $match: matchParam
        },
        {
            $lookup: {
                from: "Profile",
                localField: "profile_id",
                foreignField: "_id",
                as: "profile"
            }
        },
        {
            $group: {
                _id: "$user_id",
                true_answer: {$sum: "$true_answer"},
                earn: {$sum: "$earn"},
                profile: {$first: "$profile"},
            }
        },
        {
            $project: {
                "_id": 0,
                "profile.joker": 0,
                "profile.coin": 0,
                "profile.money": 0,
                "profile.energy": 0,
                "profile.user_id": 0,
                "profile.badges": 0
            }
        },
        {
            $sort: {
                true_answer: -1
            }
        }
    ], (err, rank) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        else
        {
            res.json(rank)
        }
    })
})

router.post('/statistic', (req, res) => {
    const {profile_id} = req.body;

    Scores.aggregate([
        {
            $match: {profile_id: mongoose.Types.ObjectId(profile_id)}
        },
        {
            $group: {
                _id: "$mod_id",
                true_answer: {$sum: "$true_answer"},
                earn: {$sum: "$earn"},
                win: {$sum: {$cond: [{$eq:["$win", true]}, 1, 0]}}
            }
        }
    ],(err, rank) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        res.json(rank)
    })
})

module.exports = router