module.exports = {

	traverseSchema: function(root) {
		for(a in root) {
			// do something...

			
		}
	},
	buildFromSchema: function(schemaDir, rootSchemaName) {

		fs = require("fs");
		schemaFileContents = fs.readFileSync(schemaDir + "/" + rootSchemaName);





	}

}