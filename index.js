(function() {
	const fs = require("fs"),
		path = require("path"),
		querystring = require("querystring");
	const getBody = (request) => {
		return new Promise((resolve,reject) => {
			let body = "";
	    	request.on("data", (data) => {
	            body += data;
	            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
	            if (body.length > 1e6) { 
	                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
	                request.connection.destroy();
	            }
	        });
	    	request.on("end", () => {
	    		resolve(body);
	        });
		});
	};
	class StoreServer {
		constructor(storage,options={functions:["clear","count","compress","key"],methods:["POST","GET", "PUT", "DELETE", "OPTIONS"]}) {
			const handler = (request,response) => {
				setTimeout(() => {
					const urlpath = request.url.substring(0,(request.url.indexOf("?")>0 ? request.url.indexOf("?") : request.url.length));
				    if(urlpath==="/remotestore.js") {
				    	 fs.readFile(path.normalize([__dirname,"node_modules","remotestore","index.js"].join("/")), function(error, content) {
				 	        if (error) {
				 	        	let message, code;
				 	            if(error.code == "ENOENT"){
				 	            	code = 404;
				 	                message = urlpath + " not found"+" ..\n";
				 	            }
				 	            else {
				 	                code = 500;
				 	                message = "Sorry, check with the site admin for error: "+error.code+" ..\n";
				 	            }
				 	            console.log(code,error.code,path.normalize([__dirname,urlpath].join("/")));
				 	            response.writeHead(code);
				 	            response.end(message);
				 	            response.end();
				 	        }
				 	        else {
				 	            response.writeHead(200, { "Content-Type": "text/javascript" });
				 	            response.end(content, "utf-8");
				 	        }
				 	    });
				    	 return;
				    } else {
				    	const ext = path.extname(urlpath);
				    	if(ext!=="") {
				    		fs.readFile(path.normalize([__dirname,"public",urlpath].join("/")), function(error, content) {
					 	        if (error) {
					 	        	let message, code;
					 	            if(error.code == "ENOENT"){
					 	            	code = 404;
					 	                message = urlpath + " not found"+" ..\n";
					 	            }
					 	            else {
					 	                code = 500;
					 	                message = "Sorry, check with the site admin for error: "+error.code+" ..\n";
					 	            }
					 	            console.log(code,error.code,path.normalize([__dirname,urlpath].join("/")));
					 	            response.writeHead(code);
					 	            response.end(message);
					 	            response.end();
					 	        }
					 	        else {
					 	            response.writeHead(200);
					 	            response.end(content);
					 	        }
					 	    });
					    	 return;
				    	}
				    }
				    const id = urlpath.substring(1);
			    	if(!options.methods.includes(request.method)) {
			    		const headers = {};
		      	      	headers["Access-Control-Allow-Origin"] = "*";
			    		response.writeHead(405,headers);
			    	    response.end("Method Not Allowed");
			    	    return;
			    	}
			    	if (request.method === "OPTIONS") {
			    	      const headers = {};
			    	      headers["Access-Control-Allow-Origin"] = "*";
			    	      headers["Access-Control-Allow-Methods"] = options.methods.join(",");
			    	      headers["Access-Control-Allow-Credentials"] = false;
			    	      headers["Access-Control-Max-Age"] = "86400"; // 24 hours
			    	      headers["Access-Control-Allow-Headers"] = "Content-Type, Content-Length, Authorization, Accept, User-Agent, X-Requested-With";
			    	      response.writeHead(200, headers);
			    	      response.end();
			    	} else if(request.method==="GET") {
				    	storage.get(id).then((result) => {
				    		const headers = {};
			      	      	//headers["Access-Control-Allow-Origin"] = "*";
			      	      	response.writeHead(200, headers);
				    		response.end(JSON.stringify(result));
				    	})
				    } else if(request.method==="PUT") {
				    	getBody(request).then((body) => {
				    		// insert the versioning stuff, or add a version server intermediate wrapper!
				    		storage.set(id,body).then(() => {
				    			const headers = {};
				      	      	headers["Access-Control-Allow-Origin"] = "*";
				      	      	response.writeHead(200, headers);
				      	      	response.end();
					    	})
				    	});
				    } else if(request.method==="DELETE") {
				    	storage.delete(id).then((result) => {
				    		response.end(result);
				    	})
				    } else if(request.method==="POST") {
				    	if(!options.functions.includes(id)) {
				    		const headers = {};
			      	      	headers["Access-Control-Allow-Origin"] = "*";
				    		response.writeHead(403,headers);
				    	    response.end("Forbidden");
				    	    return;
				    	}
				    	getBody(request).then((body) => {
				    		const args = JSON.parse(body);
				    		storage[id](...args).then((result) => {
				    			const headers = {};
				      	      	headers["Access-Control-Allow-Origin"] = "*";
				      	      	response.writeHead(200, headers);
				      	      	if(typeof(result)!=="undefined") {
				      	      		response.end(JSON.stringify(result));
				      	      	} else {
				      	      		response.end();
				      	      	}
					    	})
				    	});
				    }
				});
			};
			this.httpServer = require("http").createServer(handler);
		}
		listen(port,cb) {
			if(cb) {
				this.httpServer.listen(port,cb);
			} else {
				this.httpServer.listen(port);
				return Promise.resolve();
			}
		}
	}
	module.exports = StoreServer;
})();	