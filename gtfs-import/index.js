
const config = require('./config');

console.log(config);

var JSFtp = require("jsftp");
require('jsftp-checksum')(JSFtp);
 
var Ftp = new JSFtp({
  host: config.endpoint.hostname,
  port: config.endpoint.port
  //user: "user", // defaults to "anonymous"
  //pass: "1234" // defaults to "@anonymous"
});

Ftp.md5(config.endpoint.path, (err, checksum) => {
  if (err) {
    console.log(err);
  } else {
    console.log(checksum);
    // Prints something like
    // 7F1EE68D2344001A050752B669242182
  }
});