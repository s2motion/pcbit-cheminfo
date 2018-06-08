var fs = require('fs');
var XmlStream = require('xml-stream');


var stream = fs.createReadStream(__dirname + '/data/chemidplus/CurrentChemID.xml');
var xml = new XmlStream(stream);

xml.on('endElement:Chemical', function(item){
	console.log(item);
});