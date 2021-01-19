var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../models/User');
const Token = require('../models/Token');
const Profile = require('../models/Profile')
const mongoose = require('mongoose')
const {logger} = require('../utils');

router.post('/register', (req, res) => {
    const {user_name, password, e_mail, device_id,} = req.body;
    User.find({$or: [{user_name}, {e_mail}]}, (err, user) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
            throw err;
        }
        if (user.length != 0) {
            res.json({
                code: 403,
                message: "Bu kullanıcı bulunmakta"
            })
            return;
        }

        let gift_date = new Date()
        gift_date.setDate(gift_date.getDate() - 1)

        new User({
            user_name,
            password,
            e_mail,
            device_id,
            last_gift: gift_date
        }).save().then((user) => {
            new Profile({
                user_id: user._id,
                user_name
            }).save((err, profile) => {
                CreateToken(user._id, req, (token) => {
                    res.json({
                        user: {
                            _id: user._id,
                            user_name: user.user_name,
                            e_mail: user.e_mail,
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
                        },
                        token
                    })
                });
            })
        }).catch((err) => {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        })
    });
});
/* Authenticate */
router.post('/login', (req, res) => {
    const {user_name, password, device_id} = req.body;
    User.aggregate([
            {
                $match: {
                    user_name,
                    password,
                    is_visible: true
                }
            },
            {
                $lookup: {
                    from: "Profile",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "profile"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "user_name": 1,
                    "e_mail": 1,
                    "profile.user_name": 1,
                    "profile.race": 1,
                    "profile.coin": 1,
                    "profile.money": 1,
                    "profile.energy": 1,
                    "profile._id": 1,
                    "profile.joker.pass": 1,
                    "profile.joker.bomb": 1,
                    "profile.joker.correct": 1,
                    "profile.cosmetic.head": 1,
                    "profile.cosmetic.body": 1,
                    "profile.cosmetic.foot": 1,
                    "profile.cosmetic.hand": 1,
                    "profile.cosmetic.hair": 1,
                    "profile.cosmetic.eye": 1,
                }
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true
                }
            }
        ],
        (err, user) => {
            if (err) {
                logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
                throw err;
            }
            if (user.length == 0) {
                logger.info(user_name + " isimli kullanıcının bilgileri yanlış girildi")
                res.status(404).json(
                    {
                        code: 404,
                        message: "Girdiğiniz bilgilere ait kullanıcı bulunamadı."
                    });
            } else {
                CreateToken(user._id, req, (token) => {
                    User.updateOne({_id: mongoose.Types.ObjectId(user[0]._id)}, {
                        device_id,
                        is_login: true
                    }).exec()
                    res.json({
                        user: user[0],
                        token
                    })
                })
            }
        })
});

/* Logout */
router.post('/logout', (req, res) => {
    const {device_id} = req.body;

    User.updateOne({device_id}, {is_login: false}).exec()
    Token.deleteMany({device_id}).exec()

    res.json({code: 200, message: "Çıkış yapıldı"})
});

/* Device Check */
router.post('/devicecontrol', (req, res) => {
    const {device_id, version} = req.body;

    if (req.app.get('version') == version) {
        let d = new Date();
        let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
        User.aggregate([
            {
                $match: {
                    device_id,
                    is_visible: true,
                    is_login: true
                }
            },
            {
                $lookup: {
                    from: "Profile",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "profile"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "user_name": 1,
                    "e_mail": 1,
                    "profile.user_name": 1,
                    "profile.race": 1,
                    "profile.coin": 1,
                    "profile.money": 1,
                    "profile.energy": 1,
                    "profile._id": 1,
                    "profile.joker.pass": 1,
                    "profile.joker.bomb": 1,
                    "profile.joker.correct": 1,
                    "profile.cosmetic.head": 1,
                    "profile.cosmetic.body": 1,
                    "profile.cosmetic.foot": 1,
                    "profile.cosmetic.hand": 1,
                    "profile.cosmetic.hair": 1,
                    "profile.cosmetic.eye": 1,
                }
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true
                }
            }
        ], (err, user) => {
            if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
            if (user != 0) {
                CreateToken(user._id, req, (token) => {
                    res.json({
                        user: user[0],
                        token: token,
                    })
                })
            } else {
                res.json({
                    code: 404,
                    message: "Cihaz bulunamadı"
                })
            }
        })
    } else {
        res.json({
            code: 505,
            message: "Versiyonunuz güncel değil. Güncel version: " + req.app.get("version")
        })
    }

});

function CreateToken(user_id, req, success) {
    Token.deleteMany({user_id}, (err) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
            throw err;
        }
        const token = jwt.sign({user_id}, req.app.get('api_secret_key'), {expiresIn: '100 years'});
        new Token({
            token,
            user_id
        }).save().then(() => {
            success(token)
        });
    });

}


module.exports = router;
