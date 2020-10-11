var express = require('express');
var router = express.Router();
const jwt=require('jsonwebtoken')
const User = require('../models/User');
const Token = require('../models/Token');
const Profile = require('../models/Profile')
const mongoose = require('mongoose')
const { logger} = require('../utils');
/* Register */
router.post('/register', (req, res) =>{
  const {race, user_name, password, e_mail, device_id, }=req.body;

  new User({
    race_id:mongoose.Types.ObjectId(race),
    user_name,
    password,
    e_mail,
    device_id
  }).save().then( (data) => {
    new Profile ({
      user_id:data._id
    }).save().then( () => {
      res.json(data)
    })
  }).catch((err)=>{
    res.json(err);
    logger.error(err)
  })
});

/* Authenticate */
router.post('/login', (req, res) =>{
  const {user_name, password }=req.body;

  User.findOne({
    user_name,
    password,
    is_visible: true,
  }, (err, user) =>{
      if(err){
        logger.error(err)
        throw err;
        
      }
      if(!user){
        logger.info(user_name+" isimli kullanıcının bilgileri yanlış girildi")
        res.status(404).send('Girdiğiniz bilgilere ait kullanıcı bulunamadı');
      }else{
          const payload={
            uid: user._id,
            user_name,
            device_id: user.device_id 
          };
          const token=jwt.sign(payload,req.app.get('api_secret_key'),{expiresIn: '100 years'});
          new Token({
            token,
            user_id: user._id,
            device_id: user.device_id
          }).save();
          User.findByIdAndUpdate(
            user._id,
            {
                'is_login': true,
            }
        ).then((userInfo) => {
          Token.deleteMany({user_id: mongoose.Types.ObjectId(userInfo._id)},function (err) {
            if(err) logger.error(err);
          })
          res.json({
            user_id: userInfo._id,
            login: true,
            token
          })
        }).catch((err)=>{
          res.json(err);
        });
        }

  })
});

/* Logout */
router.post('/logout', (req, res) =>{
  const {user_id }=req.body;

  User.findByIdAndUpdate(
    user_id,
    {
        'is_login': false,
    }
  ).then((userInfo) => {
    Token.deleteMany({user_id: mongoose.Types.ObjectId(userInfo._id)},function (err) {
      if(err) logger.error(err);
    })
    res.json({
      user_id: userInfo._id,
      login: false
    })
  }).catch((err)=>{
    res.json(err);
  });

});

/* Device Check */
router.post('/devicecontrol', (req, res) =>{
  const {device_id, version }=req.body;
  if(req.app.get('version') == version){
    User.aggregate([
      {
        $match:{
           device_id,
           is_visible: true
        }
      },
      {
        $lookup:{
          from: "Token",
          localField: "_id",
          foreignField: "user_id",
          as: "tokens"
        }
      }
    ],(err,user) =>{
      if(err) logger.error(err);
        if(user.length == 0){
          res.json({
            registered: false,
            login: false
          })
        }else if(user[0].is_login){
          res.json({
            registered: true,
            login: true,
            token: user[0].tokens[0].token
          })
        }else{
          res.json({
            registered: true,
            login: false
          })
        }
    })
  }else{
    res.json({
      updated: false,
      last_version: req.app.get("version")
    })
  }
 
});
module.exports = router;
