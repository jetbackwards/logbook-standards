module.exports = {

	util: {
		capitalize: function(s) {
			if(!s) { 
				return s;
			}
			else {
		    	return s.charAt(0).toUpperCase() + s.slice(1);
			}
		}
	},	
	anaestheticsAppXlsxToStandard: function(filename) {
		throw "Not Implemented";		
	},

	rcoaXlsxToStandard: function(filename) {

		var XLSX = require("xlsx");
		var moment = require("moment");

		var workbook = XLSX.readFile(filename);
		var targetSheet = workbook.Sheets[workbook.SheetNames[0]];
		var sheetJson = XLSX.utils.sheet_to_json(targetSheet);

		/* special cases for wierd XLSX formatting */
		specialRows = [
				"Regional Type", "Regional Technique", "Regional Catheter", "Regional Supervision", "Regional Notes",
				"Procedure Type", "Procedure Supervision", "Procedure Supervisor", "Procedure Notes"
			];

		var irl = [];

		var workingRow = null;
		for (var i = 0; i < sheetJson.length; i++) {
			if(sheetJson[i]['Case ID'] != undefined) {
				if(workingRow != null) { irl.push(workingRow); }
				workingRow = sheetJson[i];
				for (var s = 0; s < specialRows.length; s++) {
					// make them into arrays for later...
					workingRow[specialRows[s]] = [workingRow[specialRows[s]]];
				}
			}
			else {
				for (var s = 0; s < specialRows.length; s++) {
					workingRow[specialRows[s]].push(sheetJson[i][specialRows[s]]);
				}
			}
		}
		irl.push(workingRow);


		//var fs = require("fs");
		//fs.writeFile("irl.json", JSON.stringify(irl[0]), 'utf8', function(e){});

		var sessionTranslation = {
			"morning-0800-1300": "Morning",
			"afternoon-1300-1800": "Afternoon",
			"evening-1800-2200": "Evening",
			"night-2200-0800": "Night",
		};
		var regionalTranslation = {
			"Regional Type": "type",
			"Regional Technique": "technique",
			"Regional Catheter": "catheter",
			"Regional Supervision": "supervision",
			"Regional Notes": "notes"
		};
		var procedureTranslation = {
			"Procedure Type": "type",
			"Procedure Supervision": "supervision",
			"Procedure Supervisor": "supervisor",
			"Procedure Notes": "notes"
		};

		var outputList = [];

		for (var i = 0; i < irl.length; i++) {
		
			var session = irl[i]["Time"];
			for(s in sessionTranslation) {
				session = session.replace(s, sessionTranslation[s]);
			}
			var dateMoment = moment(irl[i]["Date"], "D MMMM YYYY");
			var date = dateMoment.format("DD-MM-YYYY");

			var patientAge = irl[i]["Age"].split(" ");
			var patient = {
				"age": parseInt(patientAge[0]),
				"age_units": this.util.capitalize(patientAge[1]),
				"asa": parseInt(irl[i]["ASA"].replace("asa-", ""))
			};

			var regional = [];
			for (var j = 0; j < irl[i]["Regional Type"].length; j++) {
				var regionalListItem = {};
				var push = false;
				for(r in regionalTranslation) {
					push = push || (irl[i][r][j] != null);
					regionalListItem[regionalTranslation[r]] = irl[i][r][j];
				}
				if(push) {
					regional.push(regionalListItem);				
				}
			}

			var procedures = [];
			for (var k = 0; k < irl[i]["Procedure Type"].length; k++) {
				var procedureListItem = {};
				var push = false;
				for(p in procedureTranslation) {
					push = push || (irl[i][p][k] != null);
					procedureListItem[procedureTranslation[p]] = irl[i][p][k];
				}
				if(push) {
					procedures.push(procedureListItem);				
				}
			}

			var record = {
				"metadata": {
					"setting": "",
					"unique_id": "",
					"comment": "",
					"version": "",
					"timestamp": ""
				},
				"id": 1,
				"category": {
					"id": 1,
					"category_type": "Anaesthesia"
				},
				"activity_grouping": {
					"activity_name": "Theatre List",
					"id": 1,
				},
				"timing": {
					"start": "",
					"end": "",
					"category": ""
				},
				"actors": [
					{
						"id": 1,
						"role": "Patient"
					}
				],
				"events": [
					{
						"id": 1,
						"event_type": "procedure",
						"event": {
							"procedure": {
								"airway": {
									"tracheal intubation": {
										
									}
								}
							},
						}
					}

				]
			};


			var record = {
				"encounter": { "date": date, "session": session },
				"details": {
					"type": "Anaesthetic",
					"speciality": irl[i]["Primary Speciality"],
					"operation": irl[i]["Operation"],
					"priority": this.util.capitalize(irl[i]["Priority"]),	
					"destination": (irl[i]["Day Case"] == "yes" ? "Day Case" : "Ward"),
					"anaesthesia": irl[i]["Mode of Anaesthesia"]
				},
				"patient": patient,
				"training": {
					"supervision": irl[i]["Supervision"],
					"supervisor": this.util.capitalize(irl[i]["Supervisor"]),
					"teaching": this.util.capitalize(irl[i]["Teaching"])
				},
				"regional": regional,
				"procedures": procedures,
				"incidents": [],
				"notes": irl[i]["Notes"],
				"metadata": {
					"id": irl[i]["Case ID"],
					"name": "lifelong.rcoa.ac.uk",
					"version": "0.1",
					"dt_insert": 1601298522643,
					"dt_start": 1533153600000
				},
			}	

			outputList.push(record);

		}

		return outputList;

	},


};