var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();


var db = new sqlite3.Database(':memory:');

/* GET home page. */
router.get('/', function(req, res, next) {
  db.serialize(function() {   
    db.run('CREATE TABLE lorem (info TEXT)');
    var stmt = db.prepare('INSERT INTO lorem VALUES (?)');

    for (var i = 0; i < 10; i++) {
      stmt.run('Ipsum ' + i);
    }

    stmt.finalize();

    db.all('SELECT rowid AS id, info FROM lorem', function(err, rows) {
      if(err){
        res.status(500).json({"status_code":500, "status_message":"internal server error"})       
      }else{        
        res.render('index', { title: 'Express', 'id_list': rows});
      }     
    });   
  });  

  db.close(); 
});

module.exports = router;