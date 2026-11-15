// Static server for the tests: / = global/ (the member app), /vendor = vendor/, /demo = tests/demo.
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),PORT=+(process.env.PORT||8766);
const MAP=[['/vendor/',path.join(ROOT,'vendor')],['/demo/',path.join(__dirname,'demo')],['/',path.join(ROOT,'global')]];
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';
 for(const [pre,dir] of MAP){if(u.startsWith(pre)){const f=path.join(dir,u.slice(pre.length));if(!f.startsWith(dir))break;
  return fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('not found');}res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});res.end(b);});}}
 res.writeHead(404);res.end('not found');}).listen(PORT,()=>console.log('serving on http://localhost:'+PORT));
