var express = require('express');
var router = express.Router();
const Items = require('../models/Item');
const Jokers = require('../models/Joker');
const Profile = require('../models/Profile')
const Inventory = require('../models/Inventory')
const UserJoker = require('../models/UserJoker')
const Invoices = require('../models/Invoices')
const mongoose = require('mongoose')
const { logger} = require('../utils');

//Satılcak itemları çek
function storeItems(uid, item_id) {
    let matchParam = { is_visible: true, store: true}
   if(item_id)
        matchParam._id = mongoose.Types.ObjectId(item_id)
    let itemPromise =  Items.aggregate([
        {
            $match: matchParam
        },
        {
            $lookup:{
                from: "Discount",
                let: {product_id: "$_id"},
                pipeline: [
                    { $match: { $expr:
                            { $and: [ { $eq: [ "$user_id", mongoose.Types.ObjectId(uid)] }, { $eq: ["$product_id", "$$product_id" ] } ] }
                        }
                    }
                ],
                as: "discount"
            }
        },
        { 
            $unwind:{
                path: "$discount",
                preserveNullAndEmptyArrays: true
            } 
        }]
    )
    return itemPromise;   
}

//Satılcak jokerleri çek
function storeJokers(uid, joker_id) {
    let matchParam = { is_visible: true, store: true}
    if(joker_id)
         matchParam._id = mongoose.Types.ObjectId(joker_id)
    let jokerPromise =  Jokers.aggregate([
        {
            $match: matchParam
        },
        {
            $lookup:{
                from: "Discount",
                let: {product_id: "$_id"},
                pipeline: [
                    { $match: { $expr:
                            { $and: [ { $eq: [ "$user_id", mongoose.Types.ObjectId(uid)] }, { $eq: ["$product_id", "$$product_id" ] } ] }
                        }
                    }
                ],
                as: "discount"
            }
        },
        { 
            $unwind:{
                path: "$discount",
                preserveNullAndEmptyArrays: true
            } 
        }]
    )
    return jokerPromise;   
}

// Ödemeyi çek ve işlemleri gerçekleştir
const checkPay = async(user, products, payment_type, type) => {
    let updateUserData={}
    let price;
    if( payment_type == 0 ){
        if(products[0].discount){
            let newCost = products[0].coin_cost - (products[0].coin_cost * products[0].discount.rate/100)
            price = newCost;
            if(user.coin >= newCost)
                updateUserData.coin = user.coin - newCost
            else
                return { status: false, message: "İşlemi gerçekleştirmek için yeterli coininiz bulunmamaktadır." }
        }else{
            price = products[0].coin_cost;
            if(user.coin >= products[0].coin_cost)
                updateUserData.coin = user.coin - products[0].coin_cost 
            else
                return { status: false, message: "İşlemi gerçekleştirmek için yeterli coininiz bulunmamaktadır." }
        }
    }
    else if(payment_type == 1){
        if(products[0].discount){
            let newCost = products[0].money_cost - (products[0].money_cost * products[0].discount.rate/100)
            price = newCost;
            if(user.money >= newCost)
                updateUserData.money = user.money - newCost
            else
                return { status: false, message: "İşlemi gerçekleştirmek için yeterli moneyiniz bulunmamaktadır." }
        }else{
            price = products[0].money_cost;
            if(user.money >= products[0].money_cost)
                updateUserData.money = user.money - products[0].money_cost 
            else
                return { status: false, message: "İşlemi gerçekleştirmek için yeterli moneyiniz bulunmamaktadır." }
        }
    }
    return { status: true, data: updateUserData, price  }   
}

function createInvoice(user_id, product_id, price, price_type, type) {
    new Invoices({
        user_id:  mongoose.Types.ObjectId(user_id),
        product_id:  mongoose.Types.ObjectId(product_id),
        price, price_type, type
    }).save();
}

//Satılacak ürünleri listele
router.get('/listproducts/:uid', async (req, res) =>{
    var products = [];
  
    await storeItems(req.params.uid).then( async (items)=>{
        await items.map((item)=>{
            products.push(item)
        })
    })

    await storeJokers(req.params.uid).then( async (jokers)=>{
        await jokers.map((joker)=>{
            products.push(joker)
        })
    })
  
    res.json(products)
})

// Ürün Satın Al
router.post('/buyproduct/:uid', (req, res) => {
    const {product_id, type, payment_type }=req.body;
    Profile.findOne({user_id:  mongoose.Types.ObjectId(req.params.uid)}, (err, user) =>{
        if(err) logger.error(err)
        switch(type){
            case 0:
                storeItems(req.params.uid, product_id).then(async (items) => {
                    if(items.length>0){
                        let data = await checkPay(user, items, payment_type, 0)
                        if(data.status){
                            await Profile.findByIdAndUpdate( mongoose.Types.ObjectId(user._id), data.data).then(async (err, uptUser) => { 
                                if(err) logger.error(err)
                                await Inventory.findOne({ user_id: mongoose.Types.ObjectId(user.user_id), item_id: mongoose.Types.ObjectId(items[0]._id)}, async (err, inventory) => {
                                    let updateData = { }
                                    createInvoice(user.user_id, items[0]._id, data.price, payment_type, 0 );
                                    if(inventory){
                                        //Kayıt Güncelle
                                        if(inventory.is_visible)
                                            updateData.count = inventory.count + 1;
                                        else{
                                            updateData.count = 1;
                                            updateData.is_visible = true
                                        }
                                        await Inventory.findByIdAndUpdate(inventory._id, updateData, async (err, uptInventory) => {
                                            if(err) logger.error(err)
                                            res.json({status: true, message: "Ödeme alındı ve envanterinizdeki item sayısı artırıldı."}) 
                                        })  
                                    }else{
                                        //Kayıt Oluştur
                                        new Inventory({
                                            user_id:  mongoose.Types.ObjectId(user.user_id),
                                            item_id:  mongoose.Types.ObjectId(items[0]._id),
                                            count:1,
                                        }).save().then((data) => {
                                            res.json({status: true, message: "Ödeme alındı ve item envantere eklendi"})
                                        })
                                    }
                                })
                            })
                        }else{
                            res.json(data)
                        }
                    }else{
                        res.json({
                            status: false,
                            message: "Satın almaya çalıştığınız ürün mevcut değildir."
                        })
                    }
                })
                break;
            case 1:
                storeJokers(req.params.uid, product_id).then(async (jokers) => {
                    if(jokers.length>0){
                        let data = await checkPay(user, jokers, payment_type, 0)
                        if(data.status){
                            await Profile.findByIdAndUpdate( mongoose.Types.ObjectId(user._id), data.data).then( async (err,uptUser) => {
                                if(err) logger.error(err)
                                await UserJoker.findOne({ user_id: mongoose.Types.ObjectId(user.user_id), joker_id: mongoose.Types.ObjectId(jokers[0]._id)}, async (err, userJoker) => {
                                    let updateData = { }
                                    createInvoice(user.user_id, jokers[0]._id, data.price, payment_type, 1 );
                                    if(userJoker){
                                        //Kayıt Güncelle
                                        if(userJoker.is_visible)
                                            updateData.count = userJoker.count + 1;
                                        else{
                                            updateData.count = 1;
                                            updateData.is_visible = true
                                        }
                                        await UserJoker.findByIdAndUpdate(userJoker._id, updateData, async (err, uptUserJoker) => {

                                            if(err) logger.error(err)
                                            res.json( {status: true, message: "Ödeme alındı ve hesabınızdaki joker artırıldı."})
                                        })  
                                    }else{
                                        //Kayıt Oluştur
                                        new UserJoker({
                                            user_id:  mongoose.Types.ObjectId(user.user_id),
                                            joker_id:  mongoose.Types.ObjectId(jokers[0]._id),
                                            count:1,
                                        }).save().then((data) => {
                                            res.json( {status: true, message: "Ödeme alındı ve hesabınıza joker eklendi"})
                                        })
                                    }
                                })
                            })  
                        }else{
                            res.json(data)
                        }
                    }else{
                        res.json({
                            status: false,
                            message: "Satın almaya çalıştığınız ürün mevcut değildir."
                        })
                    }
                })
                break;
        }
    })
   
})
// Faturalarımı göster
router.get('/listinvoice/:uid', (req, res) => {
    const { startDate, finishDate} = req.query;
    let matchParam = {user_id: mongoose.Types.ObjectId(req.params.uid)}

    if(startDate && finishDate)
        matchParam.date ={ $gt: startDate, $lt: finishDate} 

    Invoices.find(matchParam, (err, invoices) => {
        if(err) logger.error(err)
        res.json(invoices)
    })
})
module.exports = router;