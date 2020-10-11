var express = require('express');
var router = express.Router();
const { logger} = require('../utils');
const Announcement = require('../models/Announcement')

/* Announcement List */
router.get('/list', (req, res) =>{
    Announcement.find({is_visible: true}, (err, announcement) => {
        if(err) logger.error(err)
        res.json(announcement)
    })
   
});

/* Announcement Ekle */
router.post('/add', (req, res) =>{
    const {name, description} = req.body;
    new Announcement({
        name,
        description
    }).save().then((data) => {
        res.json(data)
    })
   
});


module.exports = router;
