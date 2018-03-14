var jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const Users = require('../models/users');

module.exports.signin = (req, res, next) => {
    const body = req.body
    Users.findOne({email: body.email}, (err, user) => {
        if(err) {
            return res.json({ error: err });
        }

        if(user) {
            bcrypt.compare(body.password, user.password).then(result => {
                if (result === true) {
                    const token = jwt.sign(req.body, config.key);
                    return res.json({ token: token });
                } else {
                    return res.json({ error: 'Password is not valid' });
                }
            });
        } else {
            return res.json({ error: 'User not found' });
        }
    });
};

module.exports.signup = (req, res, next) => { 
    Users.create(req.body, (err, user) => {
        if (err) {
            return res.json({ error: 'User exist' });
        }
        const token = jwt.sign(req.body, config.key);
        return res.json({ token: token });
    })
};
