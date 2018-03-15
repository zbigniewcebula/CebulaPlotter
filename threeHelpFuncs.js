//File that contains helpful funcs with/using THREE.js

//Restarts camera :V (sic!)
function restartCamera() {
	cameraFocusPos	= new THREE.Vector3(spreadSize / 2, spreadSize / 2, spreadSize / 2);
	cameraCenterPos.set(spreadSize / 2, spreadSize / 2, spreadSize / 2);
	theta	= Math.PI / 4;
	phi		= Math.PI / 4;

	radius	= 20;

	if (lastLogHash != 0) {
		addLogEntry("Camera", "Camera position and rotation reset.");
	}
}

//Clears the scene, for the loading purposes
function clearScene() {
	if (parsedData != null) {
		var	obj	= null;
		for(var i = 0; i < parsedData.length; ++i) {
			parsedData[i].mesh.material.dispose();
			parsedData[i].mesh.geometry.dispose();
			scene.remove(parsedData[i].mesh);
			parsedData[i].mesh	= null;
		}
		parsedData		= null;
		raycastable		= null;
		addLogEntry("Scene", "Cleared successfully.");
	}
}

//Raycast processing to let you see what you are targeting
function processRay(object) {
	if (object == null) {
		document.getElementById('ray_info').style.display	= "none";
		return;
	}
	if (object.name.substring(0, 6) != "POINT_") {
		document.getElementById('ray_info').style.display	= "none";
		return;
	}
	var	content	= "<table>";
	content		+= "<tr>";
	content		+= "<td>Position: </td>";
	content		+= "</tr>";
	content		+= "<tr>";
	content		+= "<td></td>";
	content		+= "<td>X: </td>";
	content		+= "<td>" + object.orgPos.x + "</td>";
	content		+= "<td>Y: </td>";
	content		+= "<td>" + object.orgPos.y + "</td>";
	content		+= "<td>Z: </td>";
	content		+= "<td>" + object.orgPos.z + "</td>";
	content		+= "</tr>";

	content		+= "<tr>";
	content		+= "<td>Color: </td>";
	content		+= "</tr>";
	content		+= "<tr>";
	content		+= "<td></td>";
	content		+= "<td>X: </td>";
	content		+= "<td>" + Math.floor(object.material.color.r * 255) + "</td>";
	content		+= "<td>Y: </td>";
	content		+= "<td>" + Math.floor(object.material.color.g * 255) + "</td>";
	content		+= "<td>Z: </td>";
	content		+= "<td>" + Math.floor(object.material.color.b * 255) + "</td>";
	content		+= "</tr>";

	content		+= "</table>";

	document.getElementById('ray_info').style.position	= "fixed";
	document.getElementById('ray_info').style.display	= "block";
	document.getElementById('ray_info').style.left		= (20 + mouse.x) + "px";
	document.getElementById('ray_info').style.top		= (20 + mouse.y) + "px";
	document.getElementById('ray_info').innerHTML		= content;
}

//Log handling
function addLogEntry(title, msg) {
	if ((title + msg).hashCode() != lastLogHash) {
		logEntries.push([
			"[" + title + "]", msg
		]);
		lastLogHash	= (title + msg).hashCode();

		var	content	= "<table>";
		for(var i = Math.max(0, logEntries.length - 10); i < logEntries.length; ++i) {
			content	+= "<tr>";

			content	+= "<td>" + logEntries[i][0] + "</td>";
			content	+= "<td>" + logEntries[i][1] + "</td>";		

			content	+= "</tr>";
		}
		content		+= "</table>";
		document.getElementById("log").innerHTML	= content;
	}
}

//Spread size of grid... I know used once...
//...but idea was to let it modify by user.
//Zoom in/out does the job.
function setSpreadSize(size) {
	spreadSize		= size;

	grid			= new THREE.GridHelper(spreadSize, spreadSize);
	grid.position.x	= spreadSize / 2;
	grid.position.z	= spreadSize / 2;
	grid.name		= "GRID";
	scene.remove("GRID");
	scene.add(grid);

	localGrid				= new THREE.GridHelper(spreadSize / 5, spreadSize);
	localGrid.position.x	= spreadSize / 2;
	localGrid.position.z	= spreadSize / 2;
	localGrid.name			= "LOCALGRID";
	scene.remove("LOCALGRID");
	scene.add(localGrid);

	axes		= new THREE.AxesHelper(spreadSize);
	axes.position.set(0, 0.05, 0);
	axes.name	= "AXES";
	scene.remove("AXES");
	scene.add(axes);
}

//Debug purposes, I wont explain this!
function generateRandomSet(amount) {
	clearScene();

	var	tempData	= new Array();
	raycastable		= new Array();

	var	success		= 0;
	var	fail		= 0;
	
	var max			= new Array(3);
	var min			= new Array(3);
	for(var l = 0; l < amount; ++l) {
		var geometry	= new THREE.SphereGeometry(spreadSize / amount, 6, 5);
		var material	= new THREE.MeshBasicMaterial({
			color:	0xFFFFFF
		});
		material.color		= new THREE.Color(Math.random(), Math.random(), Math.random());
		var sphere			= new THREE.Mesh(geometry, material);

		var orgPos			= new THREE.Vector3(
			(Math.floor(Math.random() * 1000) / 1000),
			(Math.floor(Math.random() * 1000) / 1000),
			(Math.floor(Math.random() * 1000) / 1000)
		);
		sphere.orgPos		= orgPos;

		sphere.position.x	= orgPos.x * spreadSize;
		sphere.position.y	= orgPos.y * spreadSize;
		sphere.position.z	= orgPos.z * spreadSize;
		sphere.name			= "POINT_" + sphere.position.x + ";" + sphere.position.y + ";" + sphere.position.z;

		tempData.push({
			mesh:	sphere,
			wire:	null,//wireframe,
			added:	false
		});
		raycastable.push(sphere);

		success	+= 1;

		if (success == 1) {
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
	}
	addLogEntry("RandomSet", "Generated points: " + amount);

	var	_msg	= "<table>";

	_msg	+= "<tr>";
	_msg		+= "<td><b>Total amount: </b></td><td><b>" + success + "</b></td></td>";
	_msg	+= "</tr>";
	_msg	+= "<tr>";
	_msg		+= "<td>Failed amount: </b></td><td>0 (sic!)</td>";
	_msg	+= "</tr>";
	_msg	+= "<tr>";
	_msg		+= "<td>Success amount: </b></td><td>" + success + "</td>";
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
	return tempData;
}