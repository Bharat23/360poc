var express = require('express');
var router = express.Router();

var fetch = require('node-fetch');

var config = require('../config');

router.get('/', (req, res) => {
    console.log(config.clientId);
    res.json({here:"here"});
});

router.get('/auth', (req, res) => {

});

router.get('/twolegged/oauth', (req, res) => {
    fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "client_id="+config.clientId+"&client_secret="+config.clientSecret+"&grant_type=client_credentials&scope=data:read data:write bucket:create bucket:read data:create account:read account:write"
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        res.json(data);
    })
    .catch(err => {
        res.json(err);
    });
});

router.get('/bucket/create', (req, res) => {
    var token = req.headers.authorization;
    try {
        fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({"bucketKey":"test-bucket-bharat", "policyKey": "transient"})
        })
        .then(response => response.json())
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(500).end(err.toString());
        });
    }
    catch(err) {
        res.status(501).end(err);
    }
});

router.get('/bucket/get/:bucketName', (req, res) => {
    var token = req.headers.authorization;
    var bucketName = req.params.bucketName;
    fetch('https://developer.api.autodesk.com/oss/v2/buckets/'+ bucketName +'/details', {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        }
    })
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).end(err.toString()));
});

router.get('/callback/oauth', (req, res) => {
    var code = req.query.code;
    fetch('https://developer.api.autodesk.com/authentication/v1/gettoken', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded'
        },
        data: {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://localhost:8999/api/callback/oauth'
        }
    })
    .then((response) => {
        console.log('response', response.body);
        res.json(response);
    })
    .catch(err => {
        console.log('error', err);
    });
});

router.put('/uploadfile', (req, res) => {
    console.log(req.files.file);
    var token = req.headers.authorization;
    var file = req.files.file;
    fetch('https://developer.api.autodesk.com/oss/v2/buckets/test-bucket-bharat/objects/'+ file.name, {
        method: 'PUT',
        body: file.data,
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/octet-stream"
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        res.json(data);
    })
    .catch(err => res.status(500).end(err));
    res.send(req.files);
});

module.exports = router;