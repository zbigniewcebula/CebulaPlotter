var http	= require('http');
var fs		= require('fs');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});

	if (req.url == "/") {
		req.url = "/index.html";
	}

	if (fs.existsSync("." + req.url)) {
		console.log(req.url);
		res.end(fs.readFileSync('.' + req.url));
	} else {
		console.log(req.url + " => DOES NOT EXISTS!");
	}
}).listen(8080);