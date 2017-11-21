var express = require('express');
var router = express.Router();

var UserPinModel = require('../../models/userpin.scheme');

router.post('/storepin', (req, res) => {
    var n = UserPinModel(req.body);
    n.save((err) => {
        if (err) throw err;
        console.log('Successfully saved');
    });
    res.json({status: 'success'});
});

router.get('/getpinbyid', (req, res) => {
    let tagId = req.query.tagid;
    UserPinModel.find({tagId})
    .then(data => res.json(data))
    .catch(err => res.status(500).end(err.toString()));
});

module.exports = router;