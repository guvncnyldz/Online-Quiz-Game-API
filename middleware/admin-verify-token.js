const jwt = require('jsonwebtoken')
const AdminToken = require('../models/Admin/AdminToken');
const {logger} = require('../utils');

module.exports = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.body.token || req.query.token
    if (token) {
        jwt.verify(token, req.app.get('api_secret_key'), (err, decoded) => {
            if (err) {
                logger.info(JSON.stringify(req.body))
                logger.info("Hatalı token işlemi gerçekleştirildi-Yanlış Token Formatı " + token)
                res.json({
                    code: 401,
                    message: 'Hatalı token. İşlem gerçekletirilemiyor'
                })
            } else {
                AdminToken.findOne({token}, (err, userToken) => {
                    if (err)
                        throw err;
                    if (userToken) {
                        req.decode = decoded;
                        next();
                    } else {
                        logger.info("Hatalı token işlemi gerçekleştirildi-Hatalı Token " + token)
                        logger.info(JSON.stringify(req.body))
                        res.json({
                            code: 401,
                            message: 'Hatalı token. İşlem gerçekletirilemiyor'
                        })
                    }
                })

            }
        })
    } else {
        logger.info("Hatalı token işlemi gerçekleştirildi-Token Yok " + token)
        logger.info(JSON.stringify(req.body))
        res.json({
            code: 401,
            message: 'Hatalı token. İşlem gerçekletirilemiyor'
        })
    }
};