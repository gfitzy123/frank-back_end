var jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const Users = require('../models/users');
const nodemailer = require('nodemailer');
const pug = require('pug');

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.login,
        pass: config.email.password
    }
});

// setup email data with unicode symbols
const mailOptions = {
    from: '"Frank app" <rgamretsky@gmail.com>',
    subject: 'Restore password',
    html: ''
};

const generateRestoreCode = () => {
    const code = Math.random().toString(36).slice(-6).toUpperCase();

    return new Promise((resolve, reject) => {
        bcrypt.hash(code, 10, (err, hash) => {
            if (err) {
                reject(err);
            }
            resolve({code, hash});
        });
    });
}

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function (err, hash){
            if (err) {
                reject(err);
            }
            resolve(hash);;
        });
    });
}

const signin = (req, res, next) => {
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

const signup = (req, res, next) => { 
    hashPassword(req.body.password).then((hashPassword) => {
        req.body.password = hashPassword;
        Users.create(req.body, (err, user) => {
            if (err) {
                return res.json({ error: 'User exist' });
            }
            const token = jwt.sign(req.body, config.key);
            return res.json({ token: token });
        })
    }, (err) => {
        console.log(err);
        return res.json({ error: 'Internal server error' });
    })
};

const forgotPassword = (req, res, next) => {
    Users.findOne({email : req.body.email}, (err, user) => {
        if (err || !user) {
            return res.json({ error: 'User does not exist' });
        }
        
        generateRestoreCode().then((data) => {
            user.set({ resetPasswordCode: data.hash});
            user.save((err, newUser) => {
                if(err) {
                    return res.json({ error: 'Reset password error' });
                }

                const compiledTemplate = pug.compileFile('templates/forgotPassword.pug');
                
                mailOptions.to = req.body.email;
                mailOptions.html = compiledTemplate({code: data.code});

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                        return res.json({ error: 'Send email error' });
                    }
                    console.log('Message sent: %s', info.messageId);
                    return res.json({ code: data.code});
                });
            });
        }, (err) => {
            console.log(err);
            return res.json({ error: 'Internal server error' });    
        });
    });
};

const restorePassword = (req, res, next) => {
    Users.findOne({email : req.body.email}, (err, user) => {
        if (err || !user) {
            return res.json({ error: 'User does not exist' });
        }
        bcrypt.compare(req.body.code, user.resetPasswordCode).then(result => {
            if(result === true) {
                hashPassword(req.body.password).then((hashPassword) => {
                    user.set({password: hashPassword});
                    user.save((err, newUser) => {
                        if(err) {
                            return res.json({ error: 'Reset password error' });
                        }
                        return res.sendStatus(200);
                    });
                }, (err) => {
                    console.log(err);
                    return res.json({ error: 'Internal server error' });
                });
            } else {
                return res.json({ error: 'Code is not valid' });
            }
        }, (err) => {
            console.log(err);
            return res.json({ error: 'Internal server error' });    
        });
    });
};

module.exports = {
    signin: signin,
    signup: signup,
    forgotPassword: forgotPassword,
    restorePassword: restorePassword
}
