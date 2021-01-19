var express = require('express');
var router = express.Router();
const { logger} = require('../utils');
const Badges = require('../models/Badges')
const GameMods = require('../models/GameMods')


/* Badges List */
router.get('/badges', (req, res) =>{
    Badges.find({is_visible: true}, (err, badges) => {
        if(err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        res.json(badges)
    })
   
});

/* GameMods List */
router.get('/gamemods', (req, res) =>{
    GameMods.find({is_visible: true}, (err, mods) => {
        if(err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        res.json(mods)
    })
   
});
module.exports = router;
