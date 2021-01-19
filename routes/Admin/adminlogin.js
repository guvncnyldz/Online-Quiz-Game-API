var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const AdminToken = require('../../models/Admin/AdminToken');
const mongoose = require('mongoose')
const {logger} = require('../../utils');

router.post('/login', (req, res) => {
    const {user_name, password} = req.body;
    if(user_name == "admin" && password == "bilgiadmin")
    {
        CreateToken(user_name, req, (token) => {
            res.json({
                code: 200,
                token
            })
        })
    }
    else
    {
        res.json({
            code: 404
        })
    }
});

function CreateToken(user_name, req, success) {
    AdminToken.deleteMany({user_name}, (err) => {
        if (err) {
            logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
            throw err;
        }
        const token = jwt.sign({user_name}, req.app.get('api_secret_key'), {expiresIn: '100 years'});
        new AdminToken({
            token,
            user_name
        }).save().then(() => {
            success(token)
        });
    });

}

module.exports = router;
