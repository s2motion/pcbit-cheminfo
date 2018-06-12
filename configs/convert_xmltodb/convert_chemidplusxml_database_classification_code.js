var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var XmlStream = require('xml-stream');

let db = new sqlite3.Database('./db/pcbit.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the pcbit database.');
});

//load ChemidIDPlus.xml (Current)
//var stream = fs.createReadStream(__dirname + '/data/chemidplus/CurrentChemID.xml');
var stream = fs.createReadStream(__dirname + '/data/chemidplus/CurrentChemID.xml');
var xml = new XmlStream(stream);
var chemical_cnt = 0;
var xml_number = 0;

var start = Date.now();

xml.preserve('Chemical', true);
xml.collect('subitem');


xml.on('endElement: Chemical', function(item) {
    /*-- classification --*/
  //get classification from xml
  var classification_list = {};
  const uuidv1 = require('uuid/v1');

  classification_list['id'] = item['$']['id']

   if(chemical_cnt > 200000) {
    // db.serialize(function() {
    //   var stmt = db.prepare("insert into chemical(uuid, chemidplus_id, display_formula, display_name, systematic_name, descriptor_name, name_substance, cas_registry_number) values (?,?,?,?,?,?,?,?)");
    //   stmt.run(chemical_info['uuid'],chemical_info['id'], chemical_info['displayFormula'],chemical_info['displayName'],chemical_info['SystematicName'],chemical_info['DescriptorName'],chemical_info['NameOfSubstance'],chemical_info['CASRegistryNumber']);
    //   stmt.finalize();

    console.log(chemical_cnt + " added");


  if(item['ClassificationList']){

    if(item['ClassificationList']) {
        // console.log(item['ClassificationList']['$children']);
        // console.log(item['ClassificationList']['$children'].length);
        for(let i = 0; i < item['ClassificationList']['$children'].length; i++){
          let classification_code = item['ClassificationList']['$children'][i];
          if(classification_code['$name']){

            classification_list['uuid'] = uuidv1();

            // console.log(" id : " + classification_list['id']
            //   + " classification code = " + classification_code['$text']
            //   );

            let code_type = '';

            if(classification_code['$name'] == 'ClassificationCode'){
              code_type = 'cc';
            }else if(classification_code['$name'] == 'SuperlistClassCode'){
              code_type = 'sc';
            }

            //insert classification code
            // db.run(`INSERT INTO classificationlist(uuid, chemical_uuid, class_code, type, chemidplus_id)
            //   VALUES(?, ?, ?, ?, ?)`, [classification_list['uuid'], '', classification_code['$text'], code_type, classification_list['id']],
            //   function(err) {
            //   if (err) {
            //     return console.log(err.message);
            //   }
            // });

            db.serialize(function() {
              let stmt = db.prepare(`INSERT INTO classificationlist(uuid, chemical_uuid, class_code, type, chemidplus_id) VALUES(?, ?, ?, ?, ?)`);
              stmt.run([classification_list['uuid'], '', classification_code['$text'], code_type, classification_list['id']]);
              stmt.finalize();

              db.on("error", function(error) {
                console.log("Getting an error : ", error);
              });
            });

            //source list
             if(classification_code['SourceList']){
                for(let i = 0; i < classification_code['SourceList']['$children'].length; i++){
                  if(classification_code['SourceList']['$children'][i]['$text']) {
                    // console.log(" source : " +  classification_code['SourceList']['$children'][i]['$text']);
                    // db.run(`INSERT INTO sourcelist(uuid, code, source) VALUES(?, ?, ?)`,
                    //   [classification_list['uuid'], 'na', classification_code['SourceList']['$children'][i]['$text']],
                    //   function(err) {
                    //   if (err) {
                    //     return console.log(err.message);
                    //   }
                    // });

                    db.serialize(function() {
                      let stmt = db.prepare(`INSERT INTO sourcelist(uuid, code, source) VALUES(?, ?, ?)`);
                      stmt.run([classification_list['uuid'], 'na', classification_code['SourceList']['$children'][i]['$text']]);
                      stmt.finalize();

                      db.on("error", function(error) {
                        console.log("Getting an error : ", error);
                      });
                    });

                  }
                }
             }
          }
        }
    }

  }

   //   db.on("error", function(error) {
    //     console.log("Getting an error : ", error);
    //   });
    // });
  }else{
    // throw new Error('Something went wrong');
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

