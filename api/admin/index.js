var express = require('express');
var router = express.Router();

var PointerModel = require('../../models/pointer.schema');

router.post('/store', (req, res) => {
    var n = PointerModel(req.body);
    n.save((err) => {
        if (err) throw err;
        console.log('Successfully saved');
    });
    res.json({ne});
});

router.get('/getpointers', (req, res) => {
    var imageId = req.query.imageid;
    PointerModel.find({imageId: imageId})
    .then(data => {console.log(data);res.json(data)})
    .catch(err => res.status(500).end(err.toString()));
});

module.exports = router;