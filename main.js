var	container;
var	camera;
var moveSpeed;
var	scene;
var	renderer;

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

var logEntries	= new Array();

function lerp(a,  b,  t) {
	return a + t * (b - a);
}

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
	radius		+= mouse.wheel * (pressedKey[16]? 2: 1);
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
		};
		reader.readAsText(loadedFile);
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
	cameraCenterPos.set(0, 0, 0);
	theta	= Math.PI / 4;
	phi		= Math.PI / 4;
	addLogEntry("Camera", "Camera position and rotation reset.");
}

function addLogEntry(title, msg) {
	logEntries.push([
		"[" + title + "]", msg
	]);
	var	content	= "<table>";
	for(var i = 10; i < 10; ++i) {
		if ((logEntries.length - i) < 0)	continue;
		content	+= "<tr>";

		content	+= "<td>" + logEntries[logEntries.length - i][0] + "</td>";		
		content	+= "<td>" + logEntries[logEntries.length - i][1] + "</td>";		

		content	+= "</tr>";
	}
	content		+= "</table>";
	document.getElementById("log").innerHTML	= content;
}

function init() {
	cameraTargetPos	= new THREE.Vector3(0, 0, 0);
	cameraCenterPos	= new THREE.Vector3(0, 0, 0);
	radius			= 50;
	theta			= 0;
	phi				= 0;

	container	= document.getElementById('container');
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.98), 1, 10000);
	moveSpeed	= 100;
	restartCamera();
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, (window.innerHeight * 0.98));
	container.appendChild(renderer.domElement);

	grid		= new THREE.GridHelper(1000, 100);
	axes		= new THREE.AxesHelper(5000);
	scene.add(axes);
	scene.add(grid);

	axes.position.set(0, 0.05, 0);

	processFile();

	var sphere;
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry(10, 16, 8),
		new THREE.MeshBasicMaterial({
			color:		"red",
			wireframe:	true
		})
	);
	sphere.position.set(0, 0, 0);
	scene.add(sphere);

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
}

var deltaTime	= 0;
var lastTime	= 0;
function update(timestamp) {
	var timer	= timestamp / 1000;
	deltaTime	= timer - lastTime;
	if (isNaN(deltaTime))	deltaTime = 0;

	if (mouse.button) {
		theta	+= mouse.deltaX * 3;
		phi		+= mouse.deltaY * 3;
		if (phi < -Math.PI / 2) {
			phi = -Math.PI / 2;
		}
		if (phi > Math.PI / 2) {
			phi = Math.PI / 2;
		}
		
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
	grid.position.set(Math.floor(camera.position.x / 10) * 10, 0.01, Math.floor(camera.position.z / 10) * 10);
	camera.lookAt(cameraCenterPos);
	renderer.render(scene, camera);

	lastTime	= timer;
	window.requestAnimationFrame(update);
}


window.onload = function() {
	init();
	update();
};