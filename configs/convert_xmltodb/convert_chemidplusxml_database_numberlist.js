/* insert formular  data */

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var XmlStream = require('xml-stream');

let db = new sqlite3.Database('../../db/pcbit.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the pcbit database.');
});

db.run('PRAGMA journal_mode=off');
// db.run('PRAGMA synchronous=off');
// db.run('PRAGMA locking_mode=exclusive');

//load ChemidIDPlus.xml (Current)
//test with sample
// var stream = fs.createReadStream(__dirname + '/../../data/chemidplus/chemid_sample.xml');
//original xml data
var stream = fs.createReadStream(__dirname + '/../../data/chemidplus/CurrentChemID.xml');
var xml = new XmlStream(stream);
var chemical_cnt = 1;
var xml_number = 0;

var start = Date.now();

xml.preserve('Chemical', true);
xml.collect('subitem');


xml.on('endElement: Chemical', function(item) {
    /*-- classification --*/
  //get classification from xml
  var number_list = {};
  let code_list =
  {'CASRegistryNumber':'cn', 'IdentificationNumber':'in', 'OtherRegistryNumber':'on', 'RelatedRegistryNumber':'rn'};

  const uuidv1 = require('uuid/v1');

  number_list['id'] = item['$']['id']

  // console.log(" id : " + number_list['id']);
  // if(number_list['id'] == '000035676' && chemical_cnt < 100) {
  if(chemical_cnt > 200000) {
    db.serialize(function() {

      let stmt1 = db.prepare(`INSERT INTO numberList_forxml(uuid, chemical_uuid, type, registry_number, chemidplus_id) VALUES(?, ?, ?, ?, ?)`);
      let stmt2 = db.prepare(`INSERT INTO sourcelist(uuid, code, source) VALUES(?, ?, ?)`);

      //insert NumberList
      if(item['NumberList']){
        // console.log(item['NumberList']['$children']);

        for(let i = 0; i < item['NumberList']['$children'].length; i++){
          let name_list = item['NumberList']['$children'][i];

          if(name_list['$name']){

            number_list['uuid'] = uuidv1();

            // console.log(" id : " + number_list['id']
            //   + " name type : " + name_list['$name'] + " name = " + name_list['$text']
            //   );

            let code_type = code_list[name_list['$name']];

            stmt1.run([number_list['uuid'], '', code_type, name_list['$text'], number_list['id']]);
            // stmt.finalize();

            // source list
             if(name_list['SourceList']){
                for(let i = 0; i < name_list['SourceList']['$children'].length; i++){
                  if(name_list['SourceList']['$children'][i]['$text']) {
                    // console.log(" source name : " + name_list['SourceList']['$children'][i]['$text']);
                    stmt2.run([number_list['uuid'], 'na', name_list['SourceList']['$children'][i]['$text']]);
                    // stmt.finalize();
                  }
                }
             }
          }
        }
      }

    });
  }else{
    // throw new Error('Something went wrong');
  }

  //set chemical info on database
  console.log(chemical_cnt + " added");

  chemical_cnt += 1;
});

db.on("error", function(error) {
  console.log("Getting an error : ", error);
});

//error handler
xml.on('error', function(message) {
  console.log("error message : " + message);
  db.close(function() {
    console.log((Date.now() - start) + "ms");
  });
});

//parsing end
xml.on('end', function(item) {
  db.close(function() {
    console.log((Date.now() - start) + "ms");
  });
});

