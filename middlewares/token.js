const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports.verifyToken =  (req, res, next) => {
    var auth = req.headers['authorization'];
    if(typeof auth !== 'undefined') {
        const bearer = auth.split(' ')[1];
        jwt.verify(bearer, config.key, (err, decoded) => {
            if(!err) {
                next();
            }
            console.log(err);
        }); 
    }
    res.sendStatus(403);
};