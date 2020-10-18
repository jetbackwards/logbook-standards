const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const lgbk = require('./logbook_translator');


const app = express();
const port = 8080;

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
	res.render("index");
});


app.get("/upload", (req,res) => {
	res.render("upload");
});
app.post("/upload", (req,res) => {
	form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		var oldpath = files.uploadFile.path;
		var newpath = __dirname + '/uploads/' + files.uploadFile.name;
		fs.copyFile(oldpath, newpath, function (err) {
			if (err) throw err;
			
			records = lgbk.rcoaXlsxToStandard(newpath);

			var fs = require("fs");
			var uuid = require("uuid");

			var fileName = uuid.v4() + ".json";
			var filePath = __dirname + "/logbooks/" + fileName;

			fs.writeFile(filePath, JSON.stringify(records), 'utf8', function(e){});

			res.render("uploaded", {"file": {"name": files.uploadFile.name, "recordCount": records.length, "downloadFileName": fileName}});
		});
	});
});

app.get("/logbooks/:file", (req,res) => {
	var fs = require("fs");
	var filePath = __dirname + "/logbooks/" + req.params["file"];
	var stat = fs.statSync(filePath);
	var file = fs.readFileSync(filePath, 'binary');
	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'text/json');
	res.setHeader('Content-Disposition', 'attachment; filename='+req.params["file"]);
	res.write(file, 'binary');
	res.end();
});

app.listen(port, () => {
	console.log(`Example App Listening At http://localhost:${port}`);
});