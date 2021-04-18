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
            logger.err(new Date().toISOString() + JSON.stringify(req.body) + err);
        } else {
            res.json({online_user: result});
        }
    });
});

router.post('/addRace', (req, res) => {
    const {pid, race} = req.body;
    Profile.findOneAndUpdate({_id: mongoose.Types.ObjectId(pid)}, {race}, {new: true}, (err, profile) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
        if (!profile) {
            logger.info(req.query.uid + " id'li kullanıcı bulunmamaktadır.")
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            Scores.updateMany({profile_id: pid},{race},(err,doc) => {
                console.log(doc)
            })
            res.json(profile)
        }
    })
});

/* User Information */
router.post('/information', (req, res) => {
    Profile.findOne({_id: req.body.pid}, (err, profile) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
        if (!profile) {
            logger.info(req.query.uid + " id'li kullanıcı bulunmamaktadır.")
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            res.json(
                {

                    _id: profile._id,
                    user_name: profile.user_name,
                    race: profile.race,
                    cosmetic: {
                        head: profile.cosmetic.head,
                        body: profile.cosmetic.body,
                        foot: profile.cosmetic.foot,
                        hand: profile.cosmetic.hand,
                        hair: profile.cosmetic.hair,
                        eye: profile.cosmetic.eye,
                    }
                }
            )
        }
    })
});

router.put('/updateuser', (req, res) => {
    const {uid, user_name, coin, money, energy, e_mail} = req.body;

    User.findOneAndUpdate({_id: uid}, {user_name, e_mail}, (err, user) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        }
        if (!user) {
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            Profile.updateOne({user_id: user._id}, {user_name, coin, money, energy, e_mail}, (err) => {
                if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
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

router.post('/isuserexist',(req, res) => {
    const {user_name} = req.body

    User.find({user_name}, (err, user) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
            throw err;
        }
        if (user.length != 0) {
            res.json({
                code: 200,
                message: "Bu kullanıcı bulunmakta"
            })
        }
        else
        {
            res.json({
                code: 403,
                message: "Bu kullanıcı bulunmamakta"
            })
        }
    })
})

router.post('/mainscreen', (req, res) => {
    const {user_id} = req.body;
    User.findOne({_id: user_id}, (err, user) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        }
        if (!user) {
            res.json({
                code: 404,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        } else {
            let one_day = new Date(user.last_gift)
            one_day.setDate(one_day.getDate() + 1)
            let two_day = new Date(user.last_gift)
            two_day.setDate(two_day.getDate() + 2)
            let today = new Date();
            //today.setDate(today.getDate())

            if (today > one_day) {
                let response = {}
                if (today < two_day) {
                    if (user.gift_series >= 7) {
                        response.last_gift_series = user.gift_series;
                        user.gift_series = 1;
                    } else {
                        response.last_gift_series = user.gift_series;
                        user.gift_series = user.gift_series + 1
                    }
                } else {
                    response.last_gift_series = user.gift_series;
                    user.gift_series = 1;
                }

                user.last_gift = today;

                user.save((err) => {
                    if (err) {
                        logger.error(err)
                    } else {
                        response.gift_series = user.gift_series
                        res.json(response)
                    }
                })
            } else {
                res.json({
                    code: 200,
                    message: "Yapılacak işlem yok"
                })
            }
        }
    })
});


module.exports = router;