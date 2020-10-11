var express = require('express');
var router = express.Router();
const { logger} = require('../utils');
const Race = require('../models/Race')
const Badges = require('../models/Badges')
const GameMods = require('../models/GameMods')



/* Race List */
router.get('/races', (req, res) =>{
    Race.find({is_visible: true}, (err, races) => {
        if(err) logger.error(err)
        res.json(races)
    })
   
});

/* Badges List */
router.get('/badges', (req, res) =>{
    Badges.find({is_visible: true}, (err, badges) => {
        if(err) logger.error(err)
        res.json(badges)
    })
   
});

/* GameMods List */
router.get('/gamemods', (req, res) =>{
    GameMods.find({is_visible: true}, (err, mods) => {
        if(err) logger.error(err)
        res.json(mods)
    })
   
});
module.exports = router;
