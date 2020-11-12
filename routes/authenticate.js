var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../models/User');
const Token = require('../models/Token');
const Profile = require('../models/Profile')
const mongoose = require('mongoose')
const {logger} = require('../utils');
/* Register */
router.post('/register', (req, res) => {
    const {race, user_name, password, e_mail, device_id,} = req.body;
    User.find({$or: [{user_name}, {e_mail}]}, (err, user) => {
        if (err) {
            logger.log(err)
            throw err;
        }
        if (user.length != 0) {
            res.json({login: false})
            return;
        }
        new User({
            race: race,
            user_name,
            password,
            e_mail,
            device_id
        }).save().then((user) => {
            new Profile({
                user_id: user._id
            }).save().then(() => {
                CreateToken(user._id, req, (token) => {
                    res.json({
                        user_id: user._id,
                        login: true,
                        token
                    })
                });
            })
        }).catch((err) => {
            res.json(err);
            logger.error(err)
        })
    });
});

/* Authenticate */
router.post('/login', (req, res) => {
    const {user_name, password, device_id} = req.body;
    User.findOneAndUpdate({
        user_name,
        password,
        is_visible: true,
    },{is_login: true,device_id}, (err, user) => {
        if (err) {
            logger.error(err)
            throw err;
        }
        if (!user) {
            logger.info(user_name + " isimli kullanıcının bilgileri yanlış girildi")
            res.status(404).send('Girdiğiniz bilgilere ait kullanıcı bulunamadı');
        } else {
            CreateToken(user._id, req, (token) => {
                res.json({
                    user_id: user._id,
                    login: true,
                    token
                })
            })
        }
    })
});

/* Logout */
router.post('/logout', (req, res) => {
    const {user_id} = req.body;
    User.findByIdAndUpdate(
        user_id,
        {
            'is_login': false,
        }
    ).then((userInfo) => {
        Token.deleteMany({user_id: mongoose.Types.ObjectId(userInfo._id)}, function (err) {
            if (err) logger.error(err);
        })
        res.json({
            user_id: userInfo._id,
            login: false
        })
    }).catch((err) => {
        res.json(err);
    });

});

/* Device Check */
router.post('/devicecontrol', (req, res) => {
    const {device_id, version} = req.body;
    if (req.app.get('version') == version) {
        User.findOne({device_id,is_login:true}, (err,user) => {

            if (err) logger.error(err);
            if (user) {
                CreateToken(user._id, req, (token) => {
                    res.json({
                        login: true,
                        updated: true,
                        user_id: user._id,
                        token: token
                    })
                })
            } else {
                res.json({
                    login: false,
                    updated: true
                })
            }
        })
    } else {
        res.json({
            updated: false,
            last_version: req.app.get("version")
        })
    }

});

function CreateToken(user_id, req, success) {
    Token.deleteMany({user_id}, (err) => {
        if (err) {
            logger.log(err);
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
