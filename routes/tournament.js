var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const {logger} = require('../utils');
const Tournament = require('../models/Tournament')
const TournamentPlayers = require('../models/TournamentPlayers')
const Scores = require('../models/Scores')

router.post('/createtournament', (req, res) => {
    const {money_award, gold_award, day, money_price, gold_price} = req.body

    let today = new Date()
    today.setDate(today.getDate() + Number(day));
    let end_date = today;

    new Tournament({
        end_date,
        money_award,
        gold_award,
        money_price,
        gold_price
    }).save((err) => {
        if (err)
            logger.log(err)
        else {
            res.json({
                code: 200,
                message: "Turnuva oluşturuldu"
            })
        }
    })
})

router.post('/jointournament', (req, res) => {
    const {tournament_id, user_id} = req.body

    new TournamentPlayers({
        tournament_id,
        user_id
    }).save((err) => {
        if (err)
            logger.log(err)
        else {
            res.json({
                code: 200,
                message: "Turnuvaya Katılındı"
            })
        }
    })
})

router.post('/gettournamentinfo', ((req, res) => {
    const {user_id} = req.body

    let today = new Date()

    Tournament.aggregate([
        {
            $match: {
                $and: [{start_date: {$lt: today}}, {end_date: {$gt: today}}]
            }
        },
        {
            $lookup: {
                from: "TournamentPlayers",
                localField: "_id",
                foreignField: "tournament_id",
                as: "tournamentplayers"
            }
        }
    ], (err, info) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
        } else if (info.length == 0) {
            res.json(
                {
                    code: 404,
                    message: "Turnuva bulunmamakta"
                }
            )
        } else {
            let joined = false;
            info[0].tournamentplayers.some(player => {

                if (player.user_id == user_id) {
                    joined = true
                    return 0
                }
            })

            res.json({
                _id: info[0]._id,
                money_award: info[0].money_award,
                gold_award: info[0].gold_award,
                money_price: info[0].money_price,
                gold_price: info[0].gold_price,
                end_date: info[0].end_date,
                joined
            })
        }
    })
}))

router.post('/gettournamentstatistic', (req, res) => {
    const {tournament_id} = req.body

    Tournament.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(tournament_id)}
            },
            {
                $project: {
                    start_date: 1,
                    end_date: 1
                }
            },
            {
                $lookup: {
                    from: "TournamentPlayers",
                    localField: "_id",
                    foreignField: "tournament_id",
                    as: "tournamentplayers"
                }
            },
            {
                $lookup: {
                    from: "Profile",
                    localField: "tournamentplayers.user_id",
                    foreignField: "user_id",
                    as: "profile"
                }
            },
            {
                $project: {
                    "profile.joker": 0,
                    "profile.coin": 0,
                    "profile.money": 0,
                    "profile.energy": 0,
                    "profile.user_id": 0,
                    "profile.badges": 0,
                    "tournamentplayers": 0
                }
            },
            {
                $unwind: "$profile"
            },
            {
                $lookup: {
                    from: "Scores",
                    let: {
                        profile_id: "$profile._id",
                        start_date: "$start_date",
                        end_date: "$end_date"
                    },
                    pipeline: [
                        {
                            $project: {
                                date: 1,
                                profile_id: 1,
                                true_answer: 1,
                                race: 1,
                                mod_id: 1,
                                pid: {"$toObjectId": "$$profile_id"}
                            }
                        },
                        {
                            $match:
                                {$expr: {$eq: ["$profile_id", "$pid"]}}
                        },
                        {
                            $match: {mod_id: Number(1)}
                        },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {"$gte": ["$date", "$$start_date"]},
                                        {"$lt": ["$date", "$$end_date"]}
                                    ]
                                }
                            }
                        }
                    ],
                    as: "score"
                }
            },
            {
                $unwind: "$score"
            },
            {
                $group: {
                    _id: "$score.profile_id",
                    true_answer: {$sum: "$score.true_answer"},
                    profile: {$first: "$profile"},
                }
            },
            {
                $project: {
                    "_id": 0,
                }
            },
            {
                $sort: {
                    true_answer: -1
                }
            },
        ],
        (err, rank) => {
            if (err) {
                logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
                throw err
            }

            res.json(rank)
        }
    )
})

router.post('/checktournamentresult', (req, res) => {
    const {user_id} = req.body

    let today = new Date()
    today.setDate(today.getDate())

    TournamentPlayers.aggregate([
            {
                $match: {$and: [{user_id: mongoose.Types.ObjectId(user_id)},{is_visible: true}]
},
            },
            {
                $lookup: {
                    from: "Tournament",
                    localField: "tournament_id",
                    foreignField: "_id",
                    as: "tournament"
                }
            },
            {
                $project: {
                    "tournament": 1
                }
            }
        ],
        (err, tournament) => {
            if (err) {
                logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
                throw err
            } else if (tournament.length == 0) {
                res.json({
                    code: 404,
                    message: "Biten turnuva bulunamadı"
                })
            } else {
                if (tournament[0].tournament[0].end_date < today) {
                    Tournament.aggregate([
                            {
                                $match: {_id: mongoose.Types.ObjectId(tournament[0].tournament[0]._id)}
                            },
                            {
                                $project: {
                                    start_date: 1,
                                    end_date: 1,
                                    money_award: 1,
                                    gold_award: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: "TournamentPlayers",
                                    localField: "_id",
                                    foreignField: "tournament_id",
                                    as: "tournamentplayers"
                                }
                            },
                            {
                                $unwind: "$tournamentplayers"
                            },
                            {
                                $lookup: {
                                    from: "Scores",
                                    let: {
                                        user_id: "$tournamentplayers.user_id",
                                        start_date: "$start_date",
                                        end_date: "$end_date"
                                    },
                                    pipeline: [
                                        {
                                            $project: {
                                                date: 1,
                                                user_id: 1,
                                                true_answer: 1,
                                                race: 1,
                                                mod_id: 1,
                                                uid: {"$toObjectId": "$$user_id"}
                                            }
                                        },
                                        {
                                            $match:
                                                {$expr: {$eq: ["$user_id", "$uid"]}}
                                        },
                                        {
                                            $match: {mod_id: Number(1)}
                                        },
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {"$gte": ["$date", "$$start_date"]},
                                                        {"$lt": ["$date", "$$end_date"]}
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "score"
                                }
                            },
                            {
                                $unwind: "$score"
                            },
                            {
                                $group: {
                                    _id: "$score.user_id",
                                    true_answer: {$sum: "$score.true_answer"},
                                    user_id: {$first: "$tournamentplayers.user_id"},
                                    money_award: {$first: "$money_award"},
                                    gold_award: {$first: "$gold_award"}
                                }
                            },
                            {
                                $project: {
                                    "_id": 0,
                                }
                            },
                            {
                                $sort: {
                                    true_answer: -1
                                }
                            }],
                        (err, rank) => {
                            if (err) {
                                logger.error(new Date().toISOString() + JSON.stringify(req.body) + err)
                                throw err
                            }

                            let count = 0;
                            let flag = false
                            rank.some(r => {
                                count++;
                                if (r.user_id == user_id) {
                                    flag = true
                                    return count
                                }
                            })

                            if (!flag && count <= 3) {
                                count = -1
                            }

                            let award = {}

                            TournamentPlayers.updateOne({user_id: user_id, tournament_id: tournament[0].tournament[0]._id},{is_visible: false}).exec()

                            switch (count) {
                                case 1:
                                    award = {money_award: rank[0].money_award, gold_award: rank[0].gold_award};
                                    break
                                case 2:
                                    award = {money_award: Math.floor(rank[0].money_award /2 ), gold_award: Math.floor(rank[0].gold_award / 2)}
                                    break
                                case 3:
                                    award = {money_award: Math.floor(rank[0].money_award / 3), gold_award: Math.floor(rank[0].gold_award / 3)};
                                    break
                                default:
                                    award = {money_award: 0, gold_award: 0};
                            }

                            res.json(
                                {
                                    count,
                                    award
                                })
                        }
                    )
                } else {
                    res.json({
                        code: 404,
                        message: "Biten turnuva bulunamadı"
                    })
                }
            }
        }
    )
})

module.exports = router
