var express = require('express');
var router = express.Router();
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose')
const { logger} = require('../utils');

/** Kullanıcı Envanter Listesi */

router.get('/useritems/:uid', (req, res) =>{
    Inventory.aggregate([
        {
          $match:{
             user_id: mongoose.Types.ObjectId(req.params.uid),
             is_visible: true
          }
        },
        {
          $lookup:{
            from: "Items",
            localField: "item_id",
            foreignField: "_id",
            as: "item"
          }
        },
        {
            $project:{
                "_id":1,
                "item_id":1,
                "count": 1,
                "item.item_name":1,
                "item.photo":1,
                "item.type":1,
                "item.race_id":1
            }
        }
      ],(err,inventory) =>{
        if(err) logger.error(err);
        if(inventory.length == 0){
            logger.info(req.params.uid+" id'li envanter mevcut değildir.")
            res.json({
                status: false,
                message: "Aradığınız bilgilere göre Envanter bulunmamaktadır."
            })
        }else{
            res.json(inventory)
        }
      })
});

/** Envanterdeki eşyayı kullan */
router.put('/useitem/', (req, res) =>{
    const {item_id, user_id, item_type} = req.body;
    Inventory.aggregate([
        {
            $lookup:{
                from: "Items",
                localField: "item_id",
                foreignField: "_id",
                as: "item"
            }
        },
        {
          $match:{
             user_id: mongoose.Types.ObjectId(user_id),
             is_visible: true,
             active: true,
             "item.type": item_type
          }
        },
      ],(err,inventory) =>{
        if(err) logger.error(err);
        if(inventory.length == 0){
           Inventory.updateOne(
               {
                   user_id: mongoose.Types.ObjectId(user_id), 
                   item_id: mongoose.Types.ObjectId(item_id)
                }, 
                {active: true}
            ).then((err, item) => {
                if(err) logger.error(err);
                res.json({
                    status: true,
                    message: "İtem başarılı bir şekilde giyildi"
                })
           })
        }else{
            res.json({
                status: false,
                message: "Aynı tipte bir item zaten kullanılmakta"
            })
        }
      })
});

/** Envanterdeki eşyayı çıkar */
router.put('/unuseitem/', (req, res) =>{
    const {item_id, user_id} = req.body;
    Inventory.updateOne(
        {
            user_id: mongoose.Types.ObjectId(user_id), 
            item_id: mongoose.Types.ObjectId(item_id),
            is_visible: true,
         }, 
         {active: false}
     ).then((err, item) => {
         if(err) logger.error(err);
         res.json({
             status: true,
             message: "İtem başarılı bir şekilde çıkartıldı"
         })
    })
});

/** Envanterdeki item ı azaltma */
router.put('/reduceitem/', (req, res) =>{
    const {item_id, user_id} = req.body;
    Inventory.find(
        {
            user_id: mongoose.Types.ObjectId(user_id), 
            item_id: mongoose.Types.ObjectId(item_id),
            is_visible: true,
         }, (err, inventory) => {
             if(err) logger.error(err);

             if(inventory[0].count < 2){
                Inventory.findByIdAndUpdate(inventory[0]._id, {is_visible: false}, (err, item) => {
                    if(err) logger.error(err);
                    
                    res.json({
                        status: true,
                        message: "İtem başarılı bir şekilde kaldırıldı"
                    })
                })
             } else{
                Inventory.findByIdAndUpdate(inventory[0]._id, {count: inventory[0].count-1}, (err, item) => {
                    if(err) logger.error(err);
                    
                    res.json({
                        status: true,
                        message: "İtem başarılı bir şekilde azaltıldı"
                    })
                }) 
             }
         }
    )
   
});

module.exports = router;