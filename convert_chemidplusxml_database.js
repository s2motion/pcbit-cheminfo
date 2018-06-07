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
var stream = fs.createReadStream(__dirname + '/data/chemidplus/CurrentChemID.xml');
var xml = new XmlStream(stream);
var chemical_cnt = 0;

xml.preserve('Chemical', true);
xml.collect('subitem');
xml.on('endElement: Chemical', function(item) {
    /*-- a chemical info --*/
  //get chemical info from xml
  var chemical_info = {};
  const uuidv1 = require('uuid/v1');
  chemical_info['uuid'] = uuidv1();

  chemical_info['displayFormula'] = item['$']['displayFormula']
  chemical_info['displayName'] = item['$']['displayName']
  // console.log("DisplayFoirumla : " + item['$']['displayFormula']);
  // console.log("displayName : " + item['$']['displayName']);
  // console.log("id : " + item['$']['id']);

  if(item['NameList']['SystematicName']) {
    // console.log("SystematicName : " + item['NameList']['SystematicName']['$text']);
    chemical_info['SystematicName'] = item['NameList']['SystematicName']['$text'];
  }

  if(item['NameList']['DescriptorName']) {
    // console.log("DescriptorName : " + item['NameList']['DescriptorName']['$text']);
    chemical_info['DescriptorName'] = item['NameList']['DescriptorName']['$text'];
  }

  if(item['NameList']['NameOfSubstance']) {
    // console.log("NameOfSubstance : " + item['NameList']['NameOfSubstance']['$text']);
    chemical_info['NameOfSubstance'] = item['NameList']['NameOfSubstance']['$text'];
  }

  // console.log("NumberList: " + item['NumberList']);
  // console.log(item['NumberList']);

  if(item['NumberList']){
    if(item['NumberList']['CASRegistryNumber']) {
      // console.log("CASRegistryNumber : " + item['NumberList']['CASRegistryNumber']['$text']);
      chemical_info['CASRegistryNumber'] = item['NumberList']['CASRegistryNumber']['$text'];
    }
  }
  //check chemical_info
  // console.log(chemical_info);

  //set chemical info on database

  if(chemical_cnt < 50) {          
    db.serialize(function() {
      db.run("delete from chemical");    
      var stmt = db.prepare("insert into chemical(uuid, display_formula, display_name, systematic_name, descriptor_name, name_substance, cas_registry_number) values (?,?,?,?,?,?,?)");
      stmt.run(chemical_info['uuid'],chemical_info['display_formula'],chemical_info['display_name'],chemical_info['systematic_name'],chemical_info['descriptor_name'],chemical_info['name_substance'],chemical_info['cas_registry_number']);    
      stmt.finalize();

      chemical_cnt += 1;

      console.log("added chemical count : " + chemical_cnt);

      db.on("error", function(error) {
        console.log("Getting an error : ", error);
      }); 
    });      
  }else{    
    throw new Error('Something went wrong');          
  }
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

