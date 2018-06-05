var bigXml = require('big-xml');
    
var reader = bigXml.createReader(__dirname + '/data/chemidplus/CurrentChemID.xml', /^(file)$/, { gzip: false });

reader.on('record', function(record) {
  console.log(record);
});