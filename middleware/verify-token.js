const jwt=require('jsonwebtoken')
const Token = require('../models/Token');

module.exports=(req,res,next)=>{
    const token=req.headers['x-access-token'] || req.body.token || req.query.token
    if(token){
        jwt.verify(token,req.app.get('api_secret_key'),(err,decoded)=>{
            if(err){
                res.json({
                    status:false,
                    message:'Hatalı token. İşlem gerçekletirilemiyor'
                })
            }else{
                Token.findOne({token},(err, userToken) =>{
                    if(err)
                        throw err;
                    if(userToken){
                        req.decode=decoded;
                        next();
                    }else{
                        res.json({
                            status:false,
                            message:'Hatalı token. İşlem gerçekletirilemiyor'
                        })
                    }
                })
                
            }
        })
    }else{
        res.json({
            status:false,
            message:'Hatalı token. İşlem gerçekletirilemiyor'
        })
    }
};