# storeserver
A generic server for wrapping objects supporting the Web Storage API

# Usage

npm install storageserver


```
(function() {
	const StorageServer = require("../index.js"),
		BlockStore = require("blockstore"), // can be anything that supports the Web Storage API
		storage = new BlockStore("./data"),
		server = new StorageServer(storage);
	server.listen(3000,() => console.log("StorageServer listening ..."));
})();
```


# Release History (reverse chronological order)

v0.0.6 2017-07-30 ALPHA Updated dependencies. Adjusted example code.

v0.0.4 2017-07-30 ALPHA Incremented version of `remotestore` dependency

v0.0.3 2017-07-30 ALPHA Modified internal handler to immediately set a timeout and return. Maximizes load that can be handled at the expense of RAM.

v0.0.2 2017-07-30 ALPHA Modified `listen` to take a callback or return a Promise if no callback is provided.

v0.0.1 2017-07-30 ALPHA First public release
