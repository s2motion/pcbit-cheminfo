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
db.run('PRAGMA synchronous=off');
db.run('PRAGMA locking_mode=exclusive');

//load ChemidIDPlus.xml (Current)
// var stream = fs.createReadStream(__dirname + '/../../data/chemidplus/chemid_sample.xml');
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
  var synonym_list = {};
  let code_list = {'NameOfSubstance':'su', 'SystematicName':'sc', 'Synonyms':'sn',
  'SuperListName':'sp', 'DescriptorName':'dn', 'MixtureName':'mn'};

  const uuidv1 = require('uuid/v1');

  synonym_list['id'] = item['$']['id']

  // console.log(" id : " + synonym_list['id']);
  if(chemical_cnt > 200000) {
    db.serialize(function() {

      let stmt1 = db.prepare(`INSERT INTO synonyms_forxml(uuid, chemical_uuid, name, type, chemidplus_id) VALUES(?, ?, ?, ?, ?)`);
      let stmt2 = db.prepare(`INSERT INTO sourcelist(uuid, code, source) VALUES(?, ?, ?)`);

      if(item['NameList']){
      // if(item['NameList'] && chemical_cnt > 100000){
        // console.log(item['NameList']['$children']);
        // console.log(item['ClassificationList']['$children'].length);

        // db.run("begin transaction");

        for(let i = 0; i < item['NameList']['$children'].length; i++){
          let name_list = item['NameList']['$children'][i];

          if(name_list['$name']){

            synonym_list['uuid'] = uuidv1();

            // console.log(" id : " + synonym_list['id']
            //   + " name type : " + name_list['$name'] + " name = " + name_list['$text']
            //   );

            let code_type = code_list[name_list['$name']];

            stmt1.run([synonym_list['uuid'], '', name_list['$text'], code_type, synonym_list['id']]);
            // stmt.finalize();

            //source list
             if(name_list['SourceList']){
                for(let i = 0; i < name_list['SourceList']['$children'].length; i++){
                  if(name_list['SourceList']['$children'][i]['$text']) {
                    // console.log(" source name : " + name_list['SourceList']['$children'][i]['$text']);
                    stmt2.run([synonym_list['uuid'], 'na', name_list['SourceList']['$children'][i]['$text']]);
                    // stmt.finalize();
                  }
                }
             }
          }
        }

        // db.run("commit");
        // db.run("end transaction");

        console.log(chemical_cnt + " added");

      }

    });
  }else{
    //throw new Error('Something went wrong');
    console.log(chemical_cnt + " skipped");
  }

  //set chemical info on database
  chemical_cnt += 1;

});

db.on("error", function(error) {
  console.log("Getting an error : ", error);
});

//error handler
xml.on('error', function(message) {
  console.log("error message : " + message);
});

//parsing end
xml.on('end', function(item) {
  db.close(function() {
    console.log((Date.now() - start) + "ms");
  });
});

