var express = require('express');
var router = express.Router();
const UserJoker = require('../models/UserJoker');
const Profile = require('../models/Profile');
const mongoose = require('mongoose')
const {logger} = require('../utils');

router.put('/updatejoker', (req, res) => {
    const {pid, pass, correct, bomb} = req.body;

    let updateJoker =
        {
            pass, correct, bomb
        }
    Profile.updateOne({_id: pid}, {joker: updateJoker}, (err) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
        else {
            res.json({
                code: 200,
                message: "Jokerler başarıyla güncellendi"
            })
        }
    })
});

/* Kullanıcının Jokerlarını listele */
router.get('/userjoker/:uid', (req, res) => {
    UserJoker.aggregate([
        {
            $match: {
                user_id: mongoose.Types.ObjectId(req.params.uid),
                is_visible: true
            }
        },
        {
            $lookup: {
                from: "Jokers",
                localField: "joker_id",
                foreignField: "_id",
                as: "joker"
            }
        },
        {
            $project: {
                "_id": 1,
                "joker_id": 1,
                "count": 1,
                "joker.name": 1,
                "joker.photo": 1,
            }
        }
    ], (err, jokers) => {
        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
        if (jokers.length == 0) {
            logger.info(req.params.uid + " id'li kullanıcının herhangi bir joker ı bulunmamaktadır..")
            res.json({
                status: false,
                message: "Aradığınız bilgilere göre Joker bulunmamaktadır."
            })
        } else {
            res.json(jokers)
        }
    })
});

/* Joker Kullan */

router.put('/usejoker/', (req, res) => {
    const {joker_id, user_id} = req.body;
    UserJoker.findOne(
        {
            user_id: user_id,
            joker_id: joker_id,
            is_visible: true
        }, (err, joker) => {
            if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
            if (joker) {
                UserJoker.updateOne(
                    {
                        user_id: user_id,
                        joker_id: joker_id,
                        is_visible: true
                    },
                    {
                        count: joker.count - 1,
                        is_visible: joker.count > 1 ? true : false
                    }, (err, updateJoker) => {
                        if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);

                        res.json({
                            status: true,
                            message: "Kullanıcının jokeri kullanıldı."
                        })
                    }
                )
            } else {
                res.json({
                    status: true,
                    message: "Kullanıcıya ait böyle bir joker bulunamadı"
                })
            }
        })
});

module.exports = router;