(function() {
	const StorageServer = require("../index.js"),
		BlockStore = require("blockstore"),
		storage = new BlockStore("./data"),
		server = new StorageServer(storage);
	server.listen(3000,() => console.log("StorageServer listening ..."));
})();	