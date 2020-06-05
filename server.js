'use strict';
const express = require('express');
const passport = require('passport');
const xssec = require('@sap/xssec');
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const xsenv = require('@sap/xsenv');

const { parseJwtToken } = require('./util')

const app = express();

const services = xsenv.getServices({ uaa: 'cf-xsuaa-example' });        //must be name specified in manifest.yml and create-service command
passport.use(new JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get("/", function (req, res) {
    res.send("Example Endpoint");
});

app.get("/auth-info", function (req, res) {
    //this endpoint demonstrates that you can retrieve the login information of the current user
    //check this out to see which scopes are assigned to your user
    const token = parseJwtToken(req.headers.authorization);
    console.log(token)
    res.send("works");
});

//normal users are allowed to "get"
app.get("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('DisplayInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).send('Forbidden');
    }
    res.send("get works");
});

//admin area
app.put("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('ChangeInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).send('Forbidden');
    }
    res.send("put works");
});

app.post("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('ChangeInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).send('Forbidden');
    }
    res.send("post works");
});


app.delete("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('cf-xsuaa-example!t48462.ChangeInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).end('Forbidden');
    }
    res.send("delete works");
});


var PORT = process.env.PORT || 8088;

var server = app.listen(PORT, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);

});
