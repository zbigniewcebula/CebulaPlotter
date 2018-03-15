//File that contains functions which load/parses data

function setFileInfo(name, size) {	//Name tells everything + display
	var msg	= "";
	msg		+= "<table>";
	msg		+= "<tr><td><b>File name: </b></td><td>";
	msg		+= escape(name) + "</td></tr>";

	var	units	= ["B", "kB", "MB", "GB"];
	var	unit	= 0;
	unit		= Math.floor(size / 1024);
	if (unit >= units.length)	unit = units.length - 1;
	for(var i = 0; i < units; ++i) {
		size	/= 1024;
	}

	msg		+= "<tr><td><b>File size: </b> </td><td>" + size + " " + units[unit] + "</td></tr>";

	msg		+= "</table>";
	document.getElementById("upload_info").innerHTML = msg;
}

function processData() {		//Name tells everything
	//If everything with data is ok
	if (DATA != null && SIZE != null && PAL != null && NAME != null) {
		//Clear scene
		clearScene();

		var	tempData	= new Array();
		var tempPal		= new Array();

		//Parsing palette file
		var line		= null;
		var	lines		= PAL;
		for(var l = 0; l < lines.length; ++l) {
			if (lines[l].length > 0) {
				line	= lines[l].split(" ");
				if (line.length == 3) {
					tempPal.push(
						new THREE.Color(parseFloat(line[0]), parseFloat(line[1]), parseFloat(line[2]))
					);
				} else {
					addLogEntry("Processing", "Palette file is corrupted, aborting... Line: " + l);
					return;
				}
			}
		}


		//Variables
		raycastable		= new Array();

		var max			= new Array(3);
		var min			= new Array(3);

		//Parsing data file... you really want me to explain this? Lern2JSboi
		lines			= DATA;
		for(var l = 0; l < lines.length; ++l) {
			if (lines[l].length > 0) {
				line	= lines[l].split(" ");
				if (line.length == 4) {
					//Creating THREE.js object
					var geometry	= new THREE.SphereGeometry(spreadSize / lines.length, 24, 30);
					var material	= new THREE.MeshBasicMaterial({
						color:	0xFFFFFF
					});
					var clrIdx			= parseInt(line[3]);
					if (clrIdx > -1 && clrIdx < tempPal.length) {
						material.color	= tempPal[clrIdx];
					} else {
						material.color	= new THREE.Color(1, 1, 1);
					}
					var sphere			= new THREE.Mesh(geometry, material);

					var orgPos			= new THREE.Vector3(parseFloat(line[0]), parseFloat(line[1]), parseFloat(line[2]));
					sphere.position.x	= orgPos.x * spreadSize;
					sphere.position.y	= orgPos.y * spreadSize;
					sphere.position.z	= orgPos.z * spreadSize;
					sphere.name			= "POINT_" + sphere.position.x + ";" + sphere.position.y + ";" + sphere.position.z;

					//Additional info hidden in model obj
					sphere.orgPos		= orgPos;
					sphere.clrIndex		= clrIdx;

					tempData.push({
						mesh:		sphere,
						added:		false	
					});
					raycastable.push(sphere);

					//Detecting max/min positions
					if (l == 1) {
						max[0]	= orgPos.x;
						max[1]	= orgPos.y;
						max[2]	= orgPos.z;

						min[0]	= orgPos.x;
						min[1]	= orgPos.y;
						min[2]	= orgPos.z;
					} else {
						max[0]	= Math.max(max[0], orgPos.x);
						max[1]	= Math.max(max[1], orgPos.y);
						max[2]	= Math.max(max[2], orgPos.z);

						min[0]	= Math.min(min[0], orgPos.x);
						min[1]	= Math.min(min[1], orgPos.y);
						min[2]	= Math.min(min[2], orgPos.z);
					}
				} else {
					addLogEntry("Processing", "Data is corrupted, aborting... Line: " + l);
					return;
				}
			}
		}
		addLogEntry("Processing", "Successfully loaded points!");

		//Displaying stuff
		var	_msg	= "<table>";
		_msg	+= "<tr>";
		_msg		+= "<td><b>Total amount: </b></td><td><b>" + lines.length + "</b></td></td>";
		_msg	+= "</tr>";

		_msg	+= "<tr></tr>";

		_msg	+= "<tr>";
		_msg		+= "<td>Minimals: </b></td><td>" + min[0] + ";" + min[1] + ";" + min[2] + "</td>";
		_msg	+= "</tr>";
		_msg	+= "<tr>";
		_msg		+= "<td>Maximals: </b></td><td>" + max[0] + ";" + max[1] + ";" + max[2] + "</td>";
		_msg	+= "</tr>";

		_msg		+= "</table>";
		document.getElementById("parse_info").innerHTML	= _msg;

		//Applaying data to be added to scene
		parsedData		= tempData;
		parsedPalette	= tempPal;

		//Setting up info of file with data
		setFileInfo(NAME, SIZE);
	} else {
		//Error :V
		addLogEntry("Processing", "No data input!");
	}
}