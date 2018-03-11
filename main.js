var	container;
var	camera;
var moveSpeed;
var	scene;
var light;
var	renderer;
var raycaster;

var axes;
var grid;

var cameraTargetPos;
var cameraCenterPos;
var radius;
var theta;
var phi;

var mouse	= {
	x:		0,
	y:		0,
	relX:	0,
	relY:	0,
	deltaX:	0,
	deltaY:	0,
	button:	false,
	wheel:	0
};
var pressedKey	= {};

var loadedFile	= null;
var parsedData	= null;

var spreadSize	= 0;

var logEntries	= new Array();
var lastLogHash	= 0;

function lerp(a, b, t) {
	return a + t * (b - a);
}

String.prototype.hashCode = function() {
	var hash = 0;
	var chr;
	if (this.length === 0) return hash;
	for(var i = 0; i < this.length; i++) {
		chr		= this.charCodeAt(i);
		hash	= ((hash << 5) - hash) + chr;
		hash	|= 0;
	}
	return hash;
};

function onMouseMove(event) {
	mouse.deltaX	= mouse.relX;
	mouse.x			= event.clientX;
	mouse.relX		= (event.clientX / window.innerWidth) * 2 - 1;
	mouse.deltaX	= mouse.relX - mouse.deltaX;
	
	mouse.deltaY	= mouse.relY;
	mouse.y			= event.clientY;
	mouse.relY		= -(event.clientY / window.innerHeight) * 2 + 1;
	mouse.deltaY	= mouse.deltaY - mouse.relY;

	mouse.wheel		= 0;
}
function onMouseDown(event) {
	mouse.button	= true;
}
function onMouseUp(event) {
	mouse.button	= false;
}
function onMouseWheel(event) {
	mouse.wheel	= ((event.deltaY || -event.wheelDelta || event.detail)) || 1;
	radius		+= mouse.wheel * (pressedKey[16]? 0.5: 0.25);
}

function onKeyDown(event) {
	event			= window.event? window.event: event;
	pressedKey[event.keyCode]		= true;
	//console.log(event.keyCode);
}
function onKeyUp(event) {
	event			= window.event? window.event: event;
	pressedKey[event.keyCode]		= false;
}

function processFile() {
	var msg	= "";
	if (loadedFile != null) {
		addLogEntry("FileUpload", "Loading file...");
		msg		+= "<table>";
		msg		+= "<tr><td><b>File name: </b></td><td>";
		msg		+= escape(loadedFile.name) + "</td></tr>";
		msg		+= "<tr><td><b>File type: </b> </td><td>";
		msg		+= loadedFile.type + "</td></tr>";

		var	units	= ["B", "kB", "MB", "GB"];
		var	unit	= 0;
		var size	= loadedFile.size;
		unit		= Math.floor(size / 1024);
		if (unit >= units.length)	unit = units.length - 1;
		for(var i = 0; i < units; ++i) {
			size	/= 1024;
		}

		msg		+= "<tr><td><b>File size: </b> </td><td>" + size + " " + units[unit] + "</td></tr>";

		msg		+= "</table>";
		document.getElementById("upload_info").innerHTML = msg;

		loadedFile.data	= null;
		var	reader		= new FileReader();
		reader.onload	= function(e) {
			loadedFile.data	= e.target.result;
			var _msg		= document.getElementById("upload_info").innerHTML;
			_msg			+= "<b>File is ready!!!</b><br />";
			addLogEntry("FileUpload", "File loaded succesfully!");
			document.getElementById("upload_info").innerHTML	= _msg;

			if (loadedFile.type == "text/plain") {
				parsedData	= processTXT();
			}
		};
		reader.readAsText(loadedFile);
	}
}

function processTXT() {
	if (loadedFile != null) {
		if (loadedFile.data != null) {
			var	tempData	= new Array();
			var	lines		= loadedFile.data.split("\r\n");
			var line		= null;

			var	success		= 0;
			var	fail		= 0;
			
			var max			= new Array(3);
			var min			= new Array(3);
			for(var l = 0; l < lines.length; ++l) {
				if (lines[l].length > 0) {
					line	= lines[l].split(" ");
					if (line.length == 6) {
						console.log(line);
						var geometry	= new THREE.SphereGeometry(1, 6, 5);
						var material	= new THREE.MeshLambertMaterial({
							color:	0xFFFFFF
						});
						material.color		= new THREE.Color(parseFloat(line[3]), parseFloat(line[4]), parseFloat(line[5]));
						var sphere			= new THREE.Mesh(geometry, material);
						sphere.position.x	= parseFloat(line[0]) * spreadSize;
						sphere.position.y	= parseFloat(line[1]) * spreadSize;
						sphere.position.z	= parseFloat(line[2]) * spreadSize;

						var geo				= new THREE.EdgesGeometry(geometry);
						var mat				= new THREE.LineBasicMaterial({
							color: 0xffffff,
							linewidth: 5
						});
						var wireframe			= new THREE.LineSegments(geo, mat);
						wireframe.position.x	= sphere.position.x;
						wireframe.position.y	= sphere.position.y;
						wireframe.position.z	= sphere.position.z;

						tempData.push({
							mesh:	sphere,
							wire:	wireframe,
							added:	false
						});

						success	+= 1;

						if (success == 1) {
							max[0]	= sphere.position.x;
							max[1]	= sphere.position.y;
							max[2]	= sphere.position.z;

							min[0]	= sphere.position.x;
							min[1]	= sphere.position.y;
							min[2]	= sphere.position.z;
						} else {
							max[0]	= Math.max(max[0], sphere.position.x);
							max[1]	= Math.max(max[1], sphere.position.y);
							max[2]	= Math.max(max[2], sphere.position.z);

							min[0]	= Math.min(min[0], sphere.position.x);
							min[1]	= Math.min(min[1], sphere.position.y);
							min[2]	= Math.min(min[2], sphere.position.z);
						}
						/*
						//Debug
						addLogEntry("ProcessingTXT", "Added point: " + l + " => at: ("
							+ sphere.position.x + "; " + sphere.position.y + "; " + sphere.position.z
							+ ")"
						);
						*/
					} else {
						addLogEntry("ProcessingTXT", "Line is corrupted, ignoring...");
						fail	+= 1;
					}
				}
			}
			addLogEntry("ProcessingTXT",
					"Successfully load points: " + success
				+	", Failed: " + fail
				+	", Total: " + (success + fail)
			);

			var	_msg	= "<table>";

			_msg	+= "<tr>";
			_msg		+= "<td><b>Total amount: </b></td><td><b>" + success + "</b></td></td>";
			_msg	+= "</tr>";
			_msg	+= "<tr>";
			_msg		+= "<td>Failed amount: </b></td><td>" + fail + "</td>";
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
	}
}

function onDragOver(event) {
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect	= 'copy';
}
function onDropFile(event) {
	event.stopPropagation();
	event.preventDefault();

	loadedFile	= event.dataTransfer.files[0];
	if (loadedFile.type == "text/plain") {
		processFile();
	} else {
		addLogEntry("FileUpload", "Failed, incorrect type => " + loadedFile.type);
		loadedFile	= null;
		alert("File has incorrect type!");
	}
}
function onLoadFile(event) {
	loadedFile	= event.target.files[0];
	if (loadedFile.type == "text/plain") {
		processFile();
	} else {
		addLogEntry("FileUpload", "Failed, incorrect type => " + loadedFile.type);
		loadedFile	= null;
		alert("File has incorrect type!");
	}
}

function restartCamera() {
	cameraCenterPos.set(spreadSize / 2, 0, spreadSize / 2);
	theta	= Math.PI / 4;
	phi		= Math.PI / 4;
	if (lastLogHash != 0) {
		addLogEntry("Camera", "Camera position and rotation reset.");
	}
}

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

function setSpreadSize(size) {
	spreadSize		= size;

	grid			= new THREE.GridHelper(spreadSize, 100 / spreadSize);
	grid.position.x	= spreadSize / 2;
	grid.position.z	= spreadSize / 2;
	grid.name		= "GRID";
	scene.remove("GRID");
	scene.add(grid);

	axes		= new THREE.AxesHelper(spreadSize);
	axes.position.set(0, 0.05, 0);
	axes.name	= "AXES";
	scene.remove("AXES");
	scene.add(axes);
}

function init() {
	cameraTargetPos	= new THREE.Vector3(0, 0, 0);
	cameraCenterPos	= new THREE.Vector3(0, 0, 0);
	radius			= 20;
	theta			= 0;
	phi				= 0;

	container	= document.getElementById('container');
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.98), 1, 10000);
	moveSpeed	= 10;
	setSpreadSize(10);
	restartCamera();
	renderer.setSize(window.innerWidth, (window.innerHeight * 0.98));
	container.appendChild(renderer.domElement);

	light		= new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 100, 0);
	light.lookAt(new THREE.Vector3(0, 0, 0));
	scene.add(light);

	raycaster	= new THREE.Raycaster();

	processFile();

	container.addEventListener('mousedown', onMouseDown, false);
	container.addEventListener('mouseup', onMouseUp, false);
	container.addEventListener('mousemove', onMouseMove, false);

	container.addEventListener('wheel', onMouseWheel, false);
	container.addEventListener('mousewheel', onMouseWheel, false);
	container.addEventListener('DOMMouseScroll', onMouseWheel, false);

	document.addEventListener("keydown", onKeyDown, false);
	document.addEventListener("keyup", onKeyUp, false);
	document.addEventListener("onkeydown", onKeyDown, false);
	document.addEventListener("onkeyup", onKeyUp, false);

	container.addEventListener('dragover', onDragOver, false);
	container.addEventListener('drop', onDropFile, false);

	document.getElementById('upload')
		.addEventListener('change', onLoadFile, false);


	addLogEntry("Global", "Application inited.");
}

var deltaTime	= 0;
var lastTime	= 0;
function update(timestamp) {
	var timer	= timestamp / 1000;
	deltaTime	= timer - lastTime;
	if (isNaN(deltaTime))	deltaTime = 0;

	//Objects
	if (parsedData != null) {
		for(var i = 0; i < parsedData.length; ++i) {
			if (parsedData[i].added == false) {
				scene.add(parsedData[i].mesh);
				scene.add(parsedData[i].wire);
			}
		}
	}

	//Control
	if (mouse.button) {
		theta	+= mouse.deltaX * 3;
		phi		+= mouse.deltaY * 3;
		if (phi < -Math.PI / 2) {
			phi = -Math.PI / 2;
		}
		if (phi > Math.PI / 2) {
			phi = Math.PI / 2;
		}
		mouse.deltaX	= 0;
		mouse.deltaY	= 0;
	}

	var camLookDir		= cameraCenterPos.clone().sub(cameraTargetPos).normalize();
	var camLookDirXZF	= new THREE.Vector3(camLookDir.x, 0, camLookDir.z);
	var camLookDirXZR	= camLookDirXZF.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (22.5 + 45));

	if (pressedKey["W".charCodeAt(0)] || pressedKey[38]) {
		cameraCenterPos.add(camLookDirXZF.clone().multiplyScalar(
			deltaTime * moveSpeed * (pressedKey[16]? 2: 1)
		));
	} else if (pressedKey["S".charCodeAt(0)] || pressedKey[40]) {
		cameraCenterPos.add(camLookDirXZF.clone().multiplyScalar(
			deltaTime * -moveSpeed * (pressedKey[16]? 2: 1)
		));
	}

	if (pressedKey["A".charCodeAt(0)] || pressedKey[37]) {
		cameraCenterPos.add(camLookDirXZR.clone().multiplyScalar(
			deltaTime * -moveSpeed * (pressedKey[16]? 2: 1)
		));
	} else if (pressedKey["D".charCodeAt(0)] || pressedKey[39]) {
		cameraCenterPos.add(camLookDirXZR.clone().multiplyScalar(
			deltaTime * moveSpeed * (pressedKey[16]? 2: 1)
		));
	}

	if (pressedKey[" ".charCodeAt(0)]) {
		restartCamera();
	}

	if (pressedKey[107] || pressedKey[61]) {	//+
		radius	-= deltaTime * 50 * (pressedKey[16]? 2: 1);
	} else if (pressedKey[109] || pressedKey[173]) {	//-
		radius	+= deltaTime * 50 * (pressedKey[16]? 2: 1);
	}

	if (radius < 5) {
		radius	= 5;
	}
	cameraTargetPos	= cameraCenterPos.clone().add((new THREE.Vector3(
		Math.cos(theta), Math.sin(phi), Math.sin(theta)
	)).multiplyScalar(radius));

	camera.position.x	= lerp(camera.position.x, cameraTargetPos.x, deltaTime * 15);
	camera.position.y	= lerp(camera.position.y, cameraTargetPos.y, deltaTime * 15);
	camera.position.z	= lerp(camera.position.z, cameraTargetPos.z, deltaTime * 15);
	//grid.position.set(Math.floor(camera.position.x / 10) * 10, 0.01, Math.floor(camera.position.z / 10) * 10);
	camera.lookAt(cameraCenterPos);
	renderer.render(scene, camera);

	lastTime	= timer;
	window.requestAnimationFrame(update);
}


window.onload = function() {
	init();
	update();
};