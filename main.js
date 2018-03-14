var	container;
var	camera;
var moveSpeed;
var	scene;
var light;
var	renderer;
var raycaster;

var axes;
var grid;
var localGrid;

var importantStuff;
var importantStuffX;
var importantTimer;

var cameraTargetPos;
var cameraCenterPos;
var cameraFocusPos;
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
var raycastable	= null;

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
	radius		+= mouse.wheel * (pressedKey[16]? 0.2: 0.1);
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

function processFile(url = false) {
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

		if (url == false) {
			loadedFile.data	= null;
			var	reader		= new FileReader();
			reader.onload	= function(e) {
				loadedFile.data	= e.target.result;
				var _msg		= document.getElementById("upload_info").innerHTML;
				_msg			+= "<b>File is ready!!!</b><br />";
				addLogEntry("FileUpload", "File loaded successfully!");
				document.getElementById("upload_info").innerHTML	= _msg;

				if (loadedFile.type == "text/plain") {
					parsedData	= processTXT();
				}
			};
			reader.readAsText(loadedFile);
		} else {
			var _msg		= document.getElementById("upload_info").innerHTML;
			_msg			+= "<b>File is ready!!!</b><br />";
			addLogEntry("FileUpload", "File loaded successfully!");
			document.getElementById("upload_info").innerHTML	= _msg;

			if (loadedFile.type == "text/plain") {
				parsedData	= processTXT();
			}
		}
	}
}

function processTXT() {
	if (loadedFile != null) {
		if (loadedFile.data != null) {
			clearScene();

			var	tempData	= new Array();
			raycastable		= new Array();

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
						var geometry	= new THREE.SphereGeometry(spreadSize / lines.length, 6, 5);
						var material	= new THREE.MeshBasicMaterial({
							color:	0xFFFFFF
						});
						material.color		= new THREE.Color(parseFloat(line[3]), parseFloat(line[4]), parseFloat(line[5]));
						var sphere			= new THREE.Mesh(geometry, material);

						var orgPos			= new THREE.Vector3(parseFloat(line[0]), parseFloat(line[1]), parseFloat(line[2]));
						sphere.orgPos		= orgPos;

						sphere.position.x	= orgPos.x * spreadSize;
						sphere.position.y	= orgPos.y * spreadSize;
						sphere.position.z	= orgPos.z * spreadSize;
						sphere.name			= "POINT_" + sphere.position.x + ";" + sphere.position.y + ";" + sphere.position.z;

						/*
						var wireframe			= new THREE.LineSegments(
							new THREE.EdgesGeometry(geometry),
							new THREE.LineBasicMaterial({
								color: 0xffffff,
								linewidth: 5
							})
						);
						wireframe.position.x	= sphere.position.x;
						wireframe.position.y	= sphere.position.y;
						wireframe.position.z	= sphere.position.z;
						wireframe.name			= "WIRE_" + sphere.position.x + ";" + sphere.position.y + ";" + sphere.position.z;
						*/

						tempData.push({
							mesh:	sphere,
							wire:	null,///wireframe,
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

		/*
		var wireframe			= new THREE.LineSegments(
			new THREE.EdgesGeometry(geometry),
			new THREE.LineBasicMaterial({
				color: 0xffffff,
				linewidth: 5
			})
		);
		wireframe.position.x	= sphere.position.x;
		wireframe.position.y	= sphere.position.y;
		wireframe.position.z	= sphere.position.z;
		wireframe.name			= "WIRE_" + sphere.position.x + ";" + sphere.position.y + ";" + sphere.position.z;
		*/
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

function onExternalLoadFile(event) {
	var	url	= window.prompt("Enter URL of data file: ", "");

	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.send(null);
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			var type = request.getResponseHeader('Content-Type');
			if (type.indexOf("text") !== 1) {
				loadedFile = {
					type: "text/plain",
					data: request.responseText,
					size: request.responseText.length,
					name: url.substring(url.lastIndexOf("/"))
				};
				processFile(true);
			}
		}
	}
}

function restartCamera() {
	cameraFocusPos	= new THREE.Vector3(spreadSize / 2, spreadSize / 2, spreadSize / 2);
	cameraCenterPos.set(spreadSize / 2, spreadSize / 2, spreadSize / 2);
	theta	= Math.PI / 4;
	phi		= Math.PI / 4;
	if (lastLogHash != 0) {
		addLogEntry("Camera", "Camera position and rotation reset.");
	}
}

function clearScene() {
	if (parsedData != null) {
		var	obj	= null;
		for(var i = 0; i < parsedData.length; ++i) {
			//scene.remove(parsedData[i].wire);
			//parsedData[i].wire	= null;

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

	content	+= "</table>";

	document.getElementById('ray_info').style.position	= "fixed";
	document.getElementById('ray_info').style.display	= "block";
	document.getElementById('ray_info').style.left		= (20 + mouse.x) + "px";
	document.getElementById('ray_info').style.top		= (20 + mouse.y) + "px";
	document.getElementById('ray_info').innerHTML		= content;
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

function init() {
	cameraTargetPos	= new THREE.Vector3(0, 0, 0);
	cameraCenterPos	= new THREE.Vector3(0, 0, 0);
	radius			= 20;
	theta			= 0;
	phi				= 0;

	container	= document.getElementById('container');
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.98), 0.1, 10000);
	moveSpeed	= 10;
	setSpreadSize(20);
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

	//Controls
	document.getElementById('upload')
		.addEventListener('change', onLoadFile, false);
	document.getElementById('url_icon')
		.addEventListener('click', onExternalLoadFile, false);


	//Init message
	addLogEntry("Global", "Application inited.");
	addLogEntry("Instruction",
		"To start drag and drop file on plot area or use icon in top-left corner!<br />"
		+	"Movement is done by using WSAD+QE or Arrow keys+PageUp/PageDown.<br />"
		+	"Also I didn't forget about mouse, hold left mouse button and try to move around!<br />"
		+	"Scroll Wheel let's you zoom in and out, same as + and - buttons!<br />"
		+	"Shift key makes movement faster!!!<br />"
	);
	addLogEntry("Global", "Made by zbigniewcebula (2018)");
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
				//scene.add(parsedData[i].wire);
			}
		}
	}

	//Raycasting
	if (raycastable != null) {
		var	rayMouse	= new THREE.Vector2(mouse.relX, mouse.relY);
		raycaster.setFromCamera(rayMouse, camera);
		var intersects	= raycaster.intersectObjects(raycastable);
		if (intersects != null) {
			if (intersects.length > 0) {
				processRay(intersects[0].object);
			} else {
				processRay(null);
			}
		} else {
			processRay(null);
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


	if (radius < 0) {
		radius	= 0.01;
	}
	var radiusSpeedMod	= 1;
	if (radius <= 1.5) {
		radiusSpeedMod	= 0.25;
	} else if (radius <= 5) {
		radiusSpeedMod	= 0.25;
	} else if (radius <= 15) {
		radiusSpeedMod	= 0.5;
	}

	var	speed			= radiusSpeedMod * (pressedKey[16]? 2: 1);
	if (pressedKey["W".charCodeAt(0)] || pressedKey[38]) {
		speed		*= deltaTime * moveSpeed;
		cameraCenterPos.add(camLookDirXZF.clone().multiplyScalar(speed));
	} else if (pressedKey["S".charCodeAt(0)] || pressedKey[40]) {
		speed		*= deltaTime * -moveSpeed;
		cameraCenterPos.add(camLookDirXZF.clone().multiplyScalar(speed));
	}

	speed	= radiusSpeedMod * (pressedKey[16]? 2: 1);
	if (pressedKey["A".charCodeAt(0)] || pressedKey[37]) {
		speed		*= deltaTime * -moveSpeed;
		cameraCenterPos.add(camLookDirXZR.clone().multiplyScalar(speed));
	} else if (pressedKey["D".charCodeAt(0)] || pressedKey[39]) {
		speed		*= deltaTime * moveSpeed;
		cameraCenterPos.add(camLookDirXZR.clone().multiplyScalar(speed));
	}

	speed	= radiusSpeedMod * (pressedKey[16]? 2: 1);
	if (pressedKey["Q".charCodeAt(0)] || pressedKey[34]) {
		speed				*= deltaTime * -moveSpeed;
		cameraCenterPos.y	+= speed;
	} else if (pressedKey["E".charCodeAt(0)] || pressedKey[33]) {
		speed				*= deltaTime * moveSpeed;
		cameraCenterPos.y	+= speed;
	}

	if (pressedKey[" ".charCodeAt(0)]) {
		restartCamera();
	}

	if (pressedKey[192]) {	//`
		parsedData	= generateRandomSet(100);
	}

	var _0x23ac=['src','./img/toasty.png','style','position','fixed','zindex','1000','right','bottom','-400px','body','appendChild','sin','img/toasty.mp3','play','remove','createElement','img','setAttribute'];(function(_0x5bc0d8,_0x5f12bc){var _0x3402ef=function(_0x30e67a){while(--_0x30e67a){_0x5bc0d8['push'](_0x5bc0d8['shift']());}};_0x3402ef(++_0x5f12bc);}(_0x23ac,0x11a));var _0x2fdb=function(_0x52faae,_0x5d541a){_0x52faae=_0x52faae-0x0;var _0x2d2bfb=_0x23ac[_0x52faae];return _0x2d2bfb;};if(importantStuff==null){if(pressedKey[27]){importantStuff=document[_0x2fdb('0x0')](_0x2fdb('0x1'));importantStuff[_0x2fdb('0x2')](_0x2fdb('0x3'),_0x2fdb('0x4'));importantStuff[_0x2fdb('0x5')][_0x2fdb('0x6')]=_0x2fdb('0x7');importantStuff[_0x2fdb('0x5')][_0x2fdb('0x8')]=_0x2fdb('0x9');importantStuff[_0x2fdb('0x5')][_0x2fdb('0xa')]='1%';importantStuff['style'][_0x2fdb('0xb')]=_0x2fdb('0xc');document[_0x2fdb('0xd')][_0x2fdb('0xe')](importantStuff);importantTimer=0x0;importantStuffX='yay';pressedKey[27]=![];}}else if(importantStuff!=null){pressedKey[0x12]=![];importantTimer+=deltaTime;importantStuff[_0x2fdb('0x5')][_0x2fdb('0xb')]=-0x190+Math[_0x2fdb('0xf')](importantTimer)*0x190+'px';if(importantTimer>0x1&&importantStuffX!=null){var audio=new Audio(_0x2fdb('0x10'));audio[_0x2fdb('0x11')]();importantStuffX=null;}if(importantTimer>3.8){importantStuff[_0x2fdb('0x12')]();importantStuff=null;}}
	
	speed		*= deltaTime * -moveSpeed;
	if (pressedKey[107] || pressedKey[61]) {	//+
		speed	*= deltaTime;
		radius	+= speed * 50;
	} else if (pressedKey[109] || pressedKey[173]) {	//-
		speed	*= deltaTime;
		radius	-= speed * 50;
	}
	cameraTargetPos	= cameraCenterPos.clone().add((new THREE.Vector3(
		Math.cos(theta), Math.sin(phi), Math.sin(theta)
	)).multiplyScalar(radius));

	camera.position.x	= lerp(camera.position.x, cameraTargetPos.x, deltaTime * 15);
	camera.position.y	= lerp(camera.position.y, cameraTargetPos.y, deltaTime * 15);
	camera.position.z	= lerp(camera.position.z, cameraTargetPos.z, deltaTime * 15);
	localGrid.position.set(
		Math.round(cameraCenterPos.x / spreadSize * 10) * spreadSize / 10,
		0.01 + Math.round(cameraCenterPos.y / spreadSize * 10) * spreadSize / 10,
		Math.round(cameraCenterPos.z / spreadSize * 10) * spreadSize / 10
	);
	cameraFocusPos.set(
		lerp(cameraFocusPos.x, cameraCenterPos.x, deltaTime * 15),
		lerp(cameraFocusPos.y, cameraCenterPos.y, deltaTime * 15),
		lerp(cameraFocusPos.z, cameraCenterPos.z, deltaTime * 15)
	);
	camera.lookAt(cameraFocusPos);
	renderer.render(scene, camera);

	lastTime	= timer;
	window.requestAnimationFrame(update);
}


window.onload = function() {
	init();
	update();
};