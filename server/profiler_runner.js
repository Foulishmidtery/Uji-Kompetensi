process.env.PORT = '5005';
const http = require('http');

console.log("Memulai server mode profiling di port 5005...");
require('./server.js');

setTimeout(() => {
  console.log("Menghasilkan beban (load) buatan ke API...");
  for(let i=0; i<20; i++) {
    http.get('http://localhost:5005/api/items').on('error', () => {});
    http.get('http://localhost:5005/api/reports/summary').on('error', () => {});
  }
  
  setTimeout(() => {
    console.log("Selesai merekam profil. Mematikan server...");
    process.exit(0);
  }, 3000);
}, 3000);
