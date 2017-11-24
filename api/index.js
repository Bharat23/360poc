var express = require('express');
var router = express.Router();

var fetch = require('node-fetch');

var config = require('../config');

router.use('/admin', require('./admin'));

router.use('/user', require('./user'));

router.get('/', (req, res) => {
    console.log(config.clientId);
    res.json({here:"here"});
});

router.get('/auth', (req, res) => {

});

router.get('/getimages', (req, res) => {
    var sampleImages = [
        {url: '/images/1.jpg', tagId: 'tag-99-38', path: [{tagId: 'tag-98-272', latitude: 0.01720515095838171, longitude: 1.9699047078363354}, {tagId: 'tag-302-18', latitude: -0.007241130107705107, longitude: 0.41710938705620815}]}, 
        {url: '/images/2.jpg', tagId: 'tag-98-272', path: [{tagId: 'tag-105-388', latitude: -0.03591694075692775, longitude: 0.45238066500212015}]}, 
        {url: '/images/3.jpg', tagId: 'tag-105-388', path: [{tagId: 'tag-328-416', latitude: -0.0035799068743167517, longitude: 3.76695538684094}]}, 
        {url: '/images/4.jpg', tagId: 'tag-302-18', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/5.jpg', tagId: 'tag-208-103', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/6.jpg', tagId: 'tag-349-86', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/7.jpg', tagId: 'tag-526-55', path: [{tagId: '', latitude: '', longitude: ''}]},
        // {url: '/images/8.jpg', tagId: 'tag-645-79', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/9.jpg', tagId: 'tag-525-131', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/10.jpg', tagId: 'tag-393-129', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/11.jpg', tagId: 'tag-293-204', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/12.jpg', tagId: 'tag-288-282', path: [{tagId: '', latitude: '', longitude: ''}]},
        // {url: '/images/13.jpg', tagId: 'tag-338-303', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/14.jpg', tagId: 'tag-328-416', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/15.jpg', tagId: 'tag-448-268', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/16.jpg', tagId: 'tag-527-291', path: [{tagId: '', latitude: '', longitude: ''}]}, 
        // {url: '/images/17.jpg', tagId: 'tag-528-412', path: [{tagId: '', latitude: '', longitude: ''}]}
    ];
    res.json({images: sampleImages});
});

router.get('/twolegged/oauth', (req, res) => {
    fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "client_id="+config.clientId+"&client_secret="+config.clientSecret+"&grant_type=client_credentials&scope=data:read data:write bucket:create bucket:read data:create account:read account:write viewables:read"
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

router.get('/oauth/public', (req, res) => {
    fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "client_id="+config.clientId+"&client_secret="+config.clientSecret+"&grant_type=client_credentials&scope=viewables:read"
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
    .then(response => {console.log(response);return response.json();})
    .then(data => {
        console.log(data);
        res.json(data);
    })
    .catch(err => res.status(500).end(err.toString()));
});

router.get('/translate', (req, res) => {
    var token = req.headers.authorization;
    console.log('toen', token);
    var data = {
        input: {
            urn : 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L1NTUCUyMC0lMjBVUF9GUDElMjAtJTIwQ29weS5kd2c',
        },
        output: {
            formats: [
                {
                    type: 'svf',
                    views: [
                        '2d',
                        '3d'
                    ]
                }
            ]
        }
    };
    fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        res.json(data);
    })
    .catch(err => res.status(500).end(err.toString()));
});

var doTranslate = (token, urn) => {
};

module.exports = router;

var working = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L1VyYmFuSG91c2UtMjAxNS5ydnQ';
//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L0hvdXNlLmR3Zng - house

//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L1NTUF9QMTclMjAtJTIwRlAwMS5keGY - dxf
//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L1NTUF9QMTclMjAtJTIwRlAwMS5kd2c - dwg

//dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L1NTUCUyMC0lMjBVUF9GUDElMjAtJTIwQ29weS5kd2c - room