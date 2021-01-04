var express = require('express');
var router = express.Router();

const User = require('../models/User');
const Profile = require('../models/Profile');
const Scores = require('../models/Scores')
const mongoose = require('mongoose')
const {logger} = require('../utils');

/* Online User Count */
router.get('/onlineusercount', (req, res) => {
    User.count({is_login: true, is_visible: true}, function (err, result) {
        if (err) {
            logger.err(err);
        } else {
            res.json({online_user: result});
        }
    });
});

router.post('/addRace', (req, res) => {
    const {pid, race} = req.body;
    Profile.findOneAndUpdate({_id: mongoose.Types.ObjectId(pid)}, {race}, {new: true}, (err, profile) => {
        if (err) logger.error(err);
        if (!profile) {
            logger.info(req.query.uid + " id'li kullanıcı bulunmamaktadır.")
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            res.json(profile)
        }
    })
});

/* User Information */
router.post('/information', (req, res) => {
    Profile.findOne({_id: req.body.pid}, (err, profile) => {
        if (err) logger.error(err);
        if (!profile) {
            logger.info(req.query.uid + " id'li kullanıcı bulunmamaktadır.")
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            res.json(
                {
                    user:
                        {

                            profile: {
                                _id: profile._id,
                                user_name: profile.user_name,
                                race: profile.race,
                                coin: profile.coin,
                                money: profile.money,
                                energy: profile.energy,
                                joker: {
                                    pass: profile.joker.pass,
                                    bomb: profile.joker.bomb,
                                    correct: profile.joker.correct
                                },
                                cosmetic: {
                                    head: profile.cosmetic.head,
                                    body: profile.cosmetic.body,
                                    foot: profile.cosmetic.foot,
                                    hand: profile.cosmetic.hand,
                                    hair: profile.cosmetic.hair,
                                    eye: profile.cosmetic.eye,
                                }
                            }
                        }
                }
            )
        }
    })
});

router.put('/updateuser', (req, res) => {
    const {uid, user_name, coin, money, energy, e_mail} = req.body;
    console.log("arama: " + JSON.stringify(req.body))
    User.findOneAndUpdate({_id: uid}, {user_name, e_mail}, (err, user) => {
        if (err)
        {
            console.log(err)
            logger.log(err)
        }
        if (!user) {
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            Profile.updateOne({user_id: user._id}, {user_name, coin, money, energy, e_mail}, (err) => {
                if (err) logger.log(err)
                else {
                    res.json({
                        code: 200,
                        message: "Profil başarıyla güncellendi"
                    })
                }
            })
        }
    })
});


/* Sıralama */
router.get('/ranking', (req, res) => {
    const {mod_id, race, type} = req.query;
    let startDate, endDate;
    let d = new Date();
    let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    switch (type) {
        case "daily":
            startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59))
            endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
            break;
        case "weekly":
            startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() == 0 ? 7 : date.getDay()), 23, 59, 59))
            endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() == 0 ? 7 : date.getDay()) + 7, 23, 59, 59));
            break;
        case "montly":
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            break;
        case "yearly":
            startDate = new Date(date.getFullYear(), 0, 1);
            endDate = new Date(date.getFullYear(), 11, 31);
            break;
    }

    let matchParam = {}
    if (mod_id)
        matchParam.mod_id = mongoose.Types.ObjectId(mod_id)
    if (race)
        matchParam.race = race
    matchParam.date = {$gt: startDate, $lt: endDate}

    Scores.aggregate([
        {
            $match: matchParam
        },
        {
            $lookup: {
                from: "User",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $group: {
                _id: "$user_id",
                score: {$sum: "$score"},
                user: {$first: "$user"},
            }
        },
        {
            $sort: {
                score: -1
            }
        }
    ], (err, rank) => {
        if (err) logger.error(err)
        res.json(rank)
    })
})


module.exports = router;