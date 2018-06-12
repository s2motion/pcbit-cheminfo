var fs  = require('fs');
var xml2js = require('xml2js')
//var xml = "<root>Hello xml2js!</root>";

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/data/chemidplus/CurrentChemID.xml', function(err, data){
  parser.parseString(data, function(err, result){
    console.log(result['file']);
    console.log('Done');
  });
});