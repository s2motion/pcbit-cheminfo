'use strict';
var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/doc', function(req, res, next) {
  res.render('doc');
});

module.exports = router;