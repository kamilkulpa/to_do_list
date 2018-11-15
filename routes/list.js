var express = require('express');
var list = require('../models/lists')
var router = express.Router();

router.get('/:id', (req, res) => {
    list.renderList(req, res);
})

module.exports = router;