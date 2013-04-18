var http = require('http'),
	fs = require('fs'),
	app = require('./route');

var posts = function(cb) {
	fs.readFile(__dirname + '/posts.json', function(err, data) {
		var posts = JSON.parse(data+"");
		cb(posts);
	});
};

app.get({
	path: /^/,
	cb: function(req, res) {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		fs.createReadStream(__dirname + (req.url=='/'?'/index.html':req.url)).pipe(res);
	}
}, {
	path: /^\/api\/posts\//,
	cb: function(req, res) {		
		res.writeHead(200, { 'Content-Type': 'text/json' });
		posts(function(posts) {
			res.end(JSON.stringify(posts));
		});
	}
}, {
	path: /^\/api\/post\//,
	cb: function(req, res) {
		var parts = req.url.substr(1).split('/'),
			post = parts[2];
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		fs.createReadStream(__dirname + '/posts/' + post).pipe(res);
	}
})

http.createServer(app).listen(8080);