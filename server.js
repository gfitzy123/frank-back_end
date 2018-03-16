const express = require("express");
const auth = require("./controllers/auth");
const bodyParser = require("body-parser");
const router = express.Router;
const mongoose = require('mongoose');
const verifyToken = require('./middlewares/token').verifyToken;
const config = require('./config');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api', (req, res) => {
    res.send("Test")
});

app.get('/api/access', verifyToken, (req, res) => {
    res.send("Work");
});

app.post('/api/signin', auth.signin);
app.post('/api/signup', auth.signup);
app.post('/api/forgotPassword', auth.forgotPassword);
app.post('/api/restorePassword', auth.restorePassword);

mongoose.connect(config.connectionString, (err) => {
    if(err) {
        console.log(err);
    } else {
        console.log('MongoDB connected');
        app.listen(3000, () => {
            console.log('3000 localhost listen...');
        });
    }
});
