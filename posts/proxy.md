A Proxy from Scratch
====================

Introduction to Proxies
-----------------------
The job of a proxy is to accept requests for any site, fetch the contents on the server side, and pipe the response back to the client. To allow for more complete access of the internet a proxy should accept HTTPS requests under a certificate owned by the creator and become what is known as a man-in-the-middle proxy. It must serve as a traditional HTTP server, but in the event of an UPGRADE request tunnel the request through an HTTPS server and feed the response to the client. The creation of such a proxy is really quite simple and can be essentially made from scratch like so:

```language-javascript
var handle = function(req, res) {
	var proxy_req = http.request(req, function(proxy_res) {
		res.writeHead(proxy_res.statusCode, proxy_res.headers);
		proxy_res.pipe(res);
	});    	
	req.pipe(proxy_req);
};    
var mitm_server = https.createServer({key: keyFile, cert: certFile}, handle).listen(1338);
var server = http.createServer(handle);
server.on("upgrade", function(req, socket) {
	var proxy = net.createConnection(1338, 'localhost');		
    proxy.on('connect', function () {
        socket.write("HTTP/1.0 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n");
    });	        	
    var try_method_call = function(obj, method) {return function() {			
    	try { return obj[method].apply(obj, arguments); } catch (err) {}        	
    }};	
	["end", "close", "error", "data"].map(function(trigger) {
		proxy.on(trigger, try_method_call(socket, trigger=="data"?"write":"end"));
		socket.on(trigger, try_method_call(proxy, trigger=="data"?"write":"end"));
	}); 
});
server.listen(1337);	
```

Greater Ambitions
-----------------

Although the previously shown proxy would get the job done and could give chrome the power of unlimited access to the web, I dove in a lot deeper to the world of HTTP requests. The plan was to have a means of monetization. I figured a fee requires a membership, a membership requires login, login requires logout, and logout requires additional UI. I thus set off into the poorly documented proxy specifications. My first step was to modify the responses to include additional UI as I figured this to be the easiest step. I basically separated the website requests from those of images and other assets. Then I planned to pipe responses through a filter and insert my UI.

###Additional UI

```language-javascript
var handle = function(req, res) {
	var proxy_req = http.request(req, function(proxy_res) {
		delete proxy_res.headers['content-length'];
		res.writeHead(proxy_res.statusCode, proxy_res.headers);
		if( proxy_res.headers['content-type'].indexOf("text/html") != -1 ) {
			proxy_res.pipe(filter).pipe(res);
		} else {
			proxy_res.pipe(res);
		}
	});    	
	req.pipe(proxy_req);
};  
```

This seemed good and I quickly noticed the need to remove the content-length header considering that would change after filtering, but there was a subset of webpages I wasn't accounting for - compressed, or "gzipped", webpages. This required yet another piping, as did deflate compressed pages which I have still been unable to decode and thus send through without changes.

```language-javascript
if( proxy_res.headers['content-type'].indexOf("text/html") != -1 ) {
	if (proxy_response.headers['content-encoding'] === 'gzip') {
	    var gunzip = gzip.createUnzip();		
	    delete proxy_response.headers['content-encoding'];
	    proxy_response.pipe(gunzip).pipe(filter).pipe(response);
	} else if (proxy_response.headers['content-encoding'] === 'deflate') {
	    proxy_response.pipe(response);
	} else {
	    proxy_response.pipe(filter).pipe(response);
	}
} else {
	proxy_res.pipe(res);
}
```

###User Login

The code was already looking very complicated and full of special cases, but the process had just begun. Now that I was filtering the pages and tacking on my own styles I was ready for user login. I looked into the proxy http documentation and found the Proxy-Authenticaion and Proxy-Authorization headers. Handling this was pretty easy:

```language-javascript
if( req.headers['proxy-authorization'] ) {
	handle(req, res);
} else {
	res.writeHead(407, {
		'Proxy-Authenticate': 'Basic',
		'Proxy-Connection': 'keep-alive'
	});
	res.end();
}
```

###XHR for HTTPS Login

Basically if not logged in a popup shows up that prompts for a login, otherwise things work as usual. Of course I needed to verify the credentials but I was saving that for later on in the process. I soon noticed that Proxy-Authorization headers weren't passed over HTTPS, some security precaution I assume, and realized the need for additional infrastructure. I decided to embed an XHR in HTTPS pages that would check the credentials and redirect if they were invalid. So I embedded a script tag to perform an XHR on a made up domain, amiloggedin.com, which my proxy would handle differently. I ran the request on http://amiloggedin.com/xhr and checked if the status code was 200, if not I redirected to http://amiloggedin.com/ and let the server side take it from there.

```language-javascript
if( !request.headers['proxy-authorization'] && request.url.indexOf("xhr") == -1 ) {		
	// Not XHR, not logged in. Request login
	response.writeHead(407, {
		'Proxy-Authenticate': 'Basic',
		'Proxy-Connection': 'keep-alive',
		'Access-Control-Allow-Origin': '*'		
	});	
	response.end();
} else if( !request.headers['proxy-authorization'] ) {
	// Not logged in via XHR, throw non 407 error
	response.writeHead(404, {	
		'Access-Control-Allow-Origin': '*'
	});
	response.end();
}
```

Here's what I came up with to handle XHR checks. Throw an error if not logged in, have the javascript redirect the user to amiloggedin.com and once there throw a 407 error if they aren't logged in. Now that I had this in place, I went to implement login verification with Brainhoney. I soon realized the time taken to perform the API request would ruin my chance of piping through the proxy response if they were correct. With XHR checking already in place, I turned to it for credential verification. 

###Credential Verification

This proved rather straight forward: fetch from the API, if the credentials are valid respond with status 200, otherwise respond with status 404 and cause redirect and login. I won't bore you with the details of the Brainhoney API, but here is the gist of it:

```language-javascript
checkCredentials(request.headers['proxy-authorization'], function(query) {
	if( query.loggedIn ) {
		res.writeHead(200, {
			'Access-Control-Allow-Origin': '*'
		});
		res.end();
	} else {
		res.writeHead(404, {
			'Access-Control-Allow-Origin': '*'
		});
		res.end();
	}
});
```

###Logout & Cookies

Things were going great but I soon hit a block. How does one logout? I searched the web and the very few references that were available on proxy authentication and soon came to the conclusion that it wasn't possible. After thinking cookies were blessed with easy modification, I realized that was the answer - use cookies as well. Once again I turned to my in-place XHR and pseudo-domain and began to implement cookies. Of course cookies require a common domain and so I switched from a bare XHR script to one embedded in an iframe. The XHR part was rather simple: check for a cookie, if there is one respond 200, otherwise throw a 404 error and cause redirect and -- here in lies the issue. How could I have a login trigger when there isn't a cookie? Considering no cookies are sent immediately after a user logs in, as the request is intended for the proxy not the remote server, I would have no way of differentiating between a successful login and a cookie-based redirect. I decided to set the cookie to a flag value from the XHR failure so that the stateless server knows what it's dealing with when a seemingly false-positive shows up. Dealing with the XHR response I added a simple condition:

```language-javascript
if( !cookiePresent ) {
	response.writeHead(404, {
		'Access-Control-Allow-Origin': '*',
		'Set-Cookie': 'loggedIn=0; path=/;'
	});
	response.end();
}
```

On the server side I needed to throw 407 when there was a cookie error and yet not throw an error when no cookie was sent immediately following a login. The solution was to have a third state based on a cookie flag meaning there was an issue with the cookie.

```language-javascript
if( request.url.indexOf("xhr") == -1 && request.headers.cookie.split("=")[1] == "0" ) {
	response.writeHead(407, {
		'Proxy-Authenticate': 'Basic',
		'Proxy-Connection': 'keep-alive',
		'Set-Cookie': 'loggedIn=1; path=/;'
	});						
	response.end();
} ...
```

The only case left to handle was that of a fresh login without a cookie at all.

```language-javascript
else if( request.url.indexOf("xhr") == -1 ) {						
	response.writeHead(200, {
		'Content-Type': 'text/html',
		'Set-Cookie': 'loggedIn=1; path=/;'
	});					
	response.end();
}
```

I now had power over the login state as I had power over the cookie. I implemented logout, expired logins, and account switching. For logout I simply set the cookie to the flag value and when the user attempted to navigate they were to be redirected and hit with a login popup.

Conclusion
----------

In making a Proxy-as-a-Service, simple request and response tunneling does not suffice. HTML files should be handled differently: decompressed, filtered and restyled. For login the proxy should use native methods which can be entered from system menus; however, iframe embedded XHR requests may be necessary to make a fully functional login system. Cookies are key in logins that aren't permanent. They should be used on a reliable or virtual domain and take three states: present, absent and flagged. The flag value is necessary to differentiate a login request from a bad cookie error.