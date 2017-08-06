(function() {
	const StoreServer = require("../index.js"),
		BlockStore = require("blockstore"),
		storage = new BlockStore("./data"),
		server = new StoreServer(storage);
	server.listen(3000,() => console.log("StoreServer listening ..."));
})();	