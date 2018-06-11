'use strict';
var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();


/* GET home page. */
router.get('/', function(req, res, next) {
  let chemical_list = [];

  let db = new sqlite3.Database('./db/pcbit.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the pcbit database.');
  });

  let sql = `SELECT uuid,
              chemidplus_id,
              display_formula,
              display_name,
              systematic_name,
              descriptor_name,
              name_substance,
              cas_registry_number
            FROM chemical
              LIMIT 100`;

  db.all(sql,[], function(err, rows){
    if (err){
      throw err;
    };
    chemical_list = rows;
    res.render('index', {chemical_list: chemical_list});
  });

  db.close();

});

module.exports = router;