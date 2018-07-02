/* insert locatorList  data */

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

  var locator_list = {};
  let code_list =
  {'FileLocator':'fl', 'InternetLocator':'il', 'SuperlistLocator':'sl'};

  const uuidv1 = require('uuid/v1');

  locator_list['id'] = item['$']['id']

  // console.log(" id : " + locator_list['id']);
  // if(locator_list['id'] == '000035676' && chemical_cnt < 100) {
  if(chemical_cnt > 200000) {
    db.serialize(function() {

      let stmt1 = db.prepare(`INSERT INTO locatorlist_forxml(uuid, chemical_uuid, type, url, name, chemidplus_id)
                              VALUES(?, ?, ?, ?, ?, ?)`);

      //insert LocatorList
      if(item['LocatorList']){
        // console.log(item['LocatorList']['$children']);

        for(let i = 0; i < item['LocatorList']['$children'].length; i++){
          let name_list = item['LocatorList']['$children'][i];
          let url = '';

          if(name_list['$name']){

            locator_list['uuid'] = uuidv1();

            if(name_list['$'] && name_list['$']['url']) {
              url = name_list['$']['url'];
            }else{
              url = '';
            }

            // console.log(" id : " + locator_list['id']
            //   + " name type : " + name_list['$name'] + " name = " + name_list['$text'] + " url = " + url
            //   );

            let code_type = code_list[name_list['$name']];

            stmt1.run([locator_list['uuid'], '', code_type, url, name_list['$text'], locator_list['id']]);
            // // stmt.finalize();

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