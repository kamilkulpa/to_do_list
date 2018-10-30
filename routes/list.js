var express = require('express');
var listItem = require('../models/list_items');
var list = require('../models/lists')
var app = express();
var router = express.Router();

router.get('/:id', (req, res) => {
    list.renderList(req, res);
})

module.exports = router;