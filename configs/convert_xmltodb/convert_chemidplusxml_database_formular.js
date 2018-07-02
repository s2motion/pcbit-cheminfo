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
//var stream = fs.createReadStream(__dirname + '/../../data/chemidplus/chemid_sample.xml');
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
  var formula_list = {};
  let code_list = {'MolecularFormula':'mf', 'FormulaFragment':'ff'};

  const uuidv1 = require('uuid/v1');

  formula_list['id'] = item['$']['id']

  // console.log(" id : " + formula_list['id']);
  // if(formula_list['id'] == '' && chemical_cnt < 100) {
  if(chemical_cnt > 200000) {
    db.serialize(function() {

      let stmt1 = db.prepare(`INSERT INTO formula_forxml(uuid, type, chemical_uuid, formula, chemidplus_id) VALUES(?, ?, ?, ?, ?)`);
      let stmt2 = db.prepare(`INSERT INTO sourcelist(uuid, code, source) VALUES(?, ?, ?)`);

      //insert FormulaList Morleculaformula
      if(item['FormulaList']){
        // console.log(item['FormulaList']['$children']);

        for(let i = 0; i < item['FormulaList']['$children'].length; i++){
          let name_list = item['FormulaList']['$children'][i];

          if(name_list['$name']){

            formula_list['uuid'] = uuidv1();

            // console.log(" id : " + formula_list['id']
            //   + " name type : " + name_list['$name'] + " name = " + name_list['$text']
            //   );

            let code_type = code_list[name_list['$name']];

            stmt1.run([formula_list['uuid'], code_type, '',  name_list['$text'], formula_list['id']]);
            // stmt.finalize();

            //source list
             if(name_list['SourceList']){
                for(let i = 0; i < name_list['SourceList']['$children'].length; i++){
                  if(name_list['SourceList']['$children'][i]['$text']) {
                    // console.log(" source name : " + name_list['SourceList']['$children'][i]['$text']);
                    stmt2.run([formula_list['uuid'], 'na', name_list['SourceList']['$children'][i]['$text']]);
                    // stmt.finalize();
                  }
                }
             }
          }
        }
      }

      //insert FormulaFragmentList
      if(item['FormulaFragmentList']){
        // console.log(item['FormulaFragmentList']['$children']);

        for(let i = 0; i < item['FormulaFragmentList']['$children'].length; i++){
          let name_list = item['FormulaFragmentList']['$children'][i];

          if(name_list['$name']){

            formula_list['uuid'] = uuidv1();

            // console.log(" id : " + formula_list['id']
            //   + " name type : " + name_list['$name'] + " name = " + name_list['$text']
            //   );

            let code_type = code_list[name_list['$name']];

            stmt1.run([formula_list['uuid'], code_type, '',  name_list['$text'], formula_list['id']]);

            //source list
             if(name_list['SourceList']){
                for(let i = 0; i < name_list['SourceList']['$children'].length; i++){
                  if(name_list['SourceList']['$children'][i]['$text']) {
                    stmt2.run([formula_list['uuid'], 'na', name_list['SourceList']['$children'][i]['$text']]);
                  }
                }
             }
          }
        }
      }

      //set chemical info on database
      console.log(chemical_cnt + " added");
    });
  }else{
    // throw new Error('Something went wrong');
  }

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

