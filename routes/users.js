var express = require('express');
var router = express.Router();

const User = require('../models/User');
const Scores = require('../models/Scores')
const mongoose = require('mongoose')
const { logger} = require('../utils');

/* Online User Count */
router.get('/onlineusercount', (req, res) =>{
    User.count({ is_login: true, is_visible: true}, function(err, result) {
        if (err) {
          logger.err(err);
        } else {
          res.json({online_user: result});
        }
      });
});

/* User Information */
router.get('/information', (req, res) =>{
    User.aggregate([
        {
          $match:{
             _id: mongoose.Types.ObjectId(req.query.uid),
             is_visible: true
          }
        },
        {
          $lookup:{
            from: "Profile",
            localField: "_id",
            foreignField: "user_id",
            as: "profile"
          }
        },
        {
            $project:{
                "_id":1,
                "race":1,
                "user_name": 1,
                "e_mail":1,
                "device_id":1,
                "profile.coin":1,
                "profile.money":1,
                "profile.energy":1,
                "profile.badges":1,
                "profile.photo":1
            }
        },
        {
            $unwind:{
                path: "$profile",
                preserveNullAndEmptyArrays: true
            }
        }
      ],(err,user) =>{
        if(err) logger.error(err);
        if(user.length == 0){
            logger.info(req.params.uid+" id'li kullanıcı bulunmamaktadır.")
            res.json({
                status: false,
                message: "Aradığınız bilgilere göre kullanıcı bulunmamaktadır."
            })
        }else{
            res.json(user)
        }
      })
});

/* Sıralama */
router.get('/ranking', (req,res) => {
   const {mod_id, race, type} = req.query;
   let startDate, endDate;
   let d = new Date();
   let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
   switch (type){
        case "daily":
           startDate =  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()-1, 23, 59, 59))
           endDate =  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
           break;
        case "weekly":
           startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() -( date.getDay() == 0 ? 7 : date.getDay()), 23, 59, 59))
           endDate =  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - ( date.getDay() == 0 ? 7 : date.getDay())+7, 23, 59, 59));
           break;
        case "montly":
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate =  new Date(date.getFullYear(), date.getMonth()+1, 0);
            break;
        case "yearly":
            startDate = new Date(date.getFullYear(), 0, 1);
            endDate =  new Date(date.getFullYear(), 11, 31);
            break;
   }

   let matchParam = {}
   if(mod_id)
        matchParam.mod_id = mongoose.Types.ObjectId(mod_id)
   if(race)
        matchParam.race = race
    matchParam.date ={ $gt: startDate, $lt: endDate} 
    
   Scores.aggregate([
        {
            $match: matchParam
        },
        {
            $lookup:{
                from: "User",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $group: {
                _id: "$user_id",
                score: { $sum: "$score"},
                user: {$first: "$user"},
            }
        },
        {
            $sort:{
                score: -1
            }
        }
    ],(err, rank) =>{
        if(err) logger.error(err)
        res.json(rank)
    })
})


module.exports = router;