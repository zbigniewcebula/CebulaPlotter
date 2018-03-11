var http	= require('http');
var fs		= require('fs');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});

	console.log(req.url);
	res.end(fs.readFileSync('.' + req.url));
}).listen(8080);