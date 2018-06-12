var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/pcbit.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the pcbit database.');
});

var chemical_cnt = 0;
//set chemical info on database
db.serialize(function() {    
  db.run("delete from chemical");
  
  var stmt = db.prepare("insert into chemical(uuid, display_formula, display_name, systematic_name, descriptor_name, name_substance, cas_registry_number) values (?,?,?,?,?,?,?)");
  stmt.run(1,1,1,1,1,1,1);    
  stmt.finalize();

  chemical_cnt += 1;
  console.log("added chemical count : " + chemical_cnt);

});  


db.on("error", function(error) {
  console.log("Getting an error : ", error);
}); 


// var db = new sqlite3.Database(':memory:');

// db.serialize(function() {

//   db.run('CREATE TABLE lorem (info TEXT)');
//   var stmt = db.prepare('INSERT INTO lorem VALUES (?)');

//   for (var i = 0; i < 10; i++) {
//     stmt.run('Ipsum ' + i);
//   }

//   stmt.finalize();

//   db.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
//     console.log(row.id + ': ' + row.info);
//   });
// });

db.close();