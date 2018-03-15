//Main file that contains main loop and initialization
function init() {
	//THREE.js init
	container	= document.getElementById('container');
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.98), 0.1, 10000);
	//My funcs setting up scene and stuff
	moveSpeed	= 10;
	setSpreadSize(20);
	restartCamera();
	//Displaying important shit
	renderer.setSize(window.innerWidth, (window.innerHeight * 0.98));
	container.appendChild(renderer.domElement);

	//Adding raycaster to raycast (duh!)
	raycaster	= new THREE.Raycaster();

	//Adding events and binding them to event funcs from events.js
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


	//Processing data from GET
	processData();
}

//Main update loop
var deltaTime	= 0;
var lastTime	= 0;
function update(timestamp) {
	//Timer that helps keep things in time 
	var timer	= timestamp / 1000;
	deltaTime	= timer - lastTime;
	if (isNaN(deltaTime))	deltaTime = 0;	//Fukin JS

	//Points on the plotter
	if (parsedData != null) {
		for(var i = 0; i < parsedData.length; ++i) {
			if (parsedData[i].added == false) {
				scene.add(parsedData[i].mesh);
			}
		}
	}

	//Raycasting points
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

	//Control by mouse, mainly camera rotation
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

	//Calculating move Vectors
	var camLookDir		= cameraCenterPos.clone().sub(cameraTargetPos).normalize();
	var camLookDirXZF	= new THREE.Vector3(camLookDir.x, 0, camLookDir.z);
	var camLookDirXZR	= camLookDirXZF.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (22.5 + 45));

	//Deciding if radius affects speed of movement, setting right value...
	//...to not behave like a sonic.
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

	//Movement by WSAD/Arrows keys + SHIFT as speed up
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

	//Camera restart button => Spaaaaaaaaaaaaaaaaacee
	if (pressedKey[" ".charCodeAt(0)]) {
		restartCamera();
	}

	//Random stuff on plotter, debug purposes
	if (pressedKey[192]) {	//`
		parsedData	= generateRandomSet(100);
	}

	//Scaling points, you know, cuz they are like... really really small.
	if (pressedKey[188]) {	//<
		if (raycastable != null) {
			for(var i = 0; i < raycastable.length; ++i) {
				if (raycastable[i].scale.length() > (scaleFactor * 2)) {
					raycastable[i].scale.addScalar(-scaleFactor);
				}
			}
		}
	} else if (pressedKey[190]) {	//>
		if (raycastable != null) {
			for(var i = 0; i < raycastable.length; ++i) {
				if (raycastable[i].scale.length() < 2) {
					raycastable[i].scale.addScalar(scaleFactor);
				}
			}
		}
	}

	//Bazinga!
	var _0x23ac=['src','./img/toasty.png','style','position','fixed','zindex','1000','right','bottom','-400px','body','appendChild','sin','img/toasty.mp3','play','remove','createElement','img','setAttribute'];(function(_0x5bc0d8,_0x5f12bc){var _0x3402ef=function(_0x30e67a){while(--_0x30e67a){_0x5bc0d8['push'](_0x5bc0d8['shift']());}};_0x3402ef(++_0x5f12bc);}(_0x23ac,0x11a));var _0x2fdb=function(_0x52faae,_0x5d541a){_0x52faae=_0x52faae-0x0;var _0x2d2bfb=_0x23ac[_0x52faae];return _0x2d2bfb;};if(importantStuff==null){if(pressedKey[27]){importantStuff=document[_0x2fdb('0x0')](_0x2fdb('0x1'));importantStuff[_0x2fdb('0x2')](_0x2fdb('0x3'),_0x2fdb('0x4'));importantStuff[_0x2fdb('0x5')][_0x2fdb('0x6')]=_0x2fdb('0x7');importantStuff[_0x2fdb('0x5')][_0x2fdb('0x8')]=_0x2fdb('0x9');importantStuff[_0x2fdb('0x5')][_0x2fdb('0xa')]='1%';importantStuff['style'][_0x2fdb('0xb')]=_0x2fdb('0xc');document[_0x2fdb('0xd')][_0x2fdb('0xe')](importantStuff);importantTimer=0x0;importantStuffX='yay';pressedKey[27]=![];}}else if(importantStuff!=null){pressedKey[0x12]=![];importantTimer+=deltaTime;importantStuff[_0x2fdb('0x5')][_0x2fdb('0xb')]=-0x190+Math[_0x2fdb('0xf')](importantTimer)*0x190+'px';if(importantTimer>0x1&&importantStuffX!=null){var audio=new Audio(_0x2fdb('0x10'));audio[_0x2fdb('0x11')]();importantStuffX=null;}if(importantTimer>3.8){importantStuff[_0x2fdb('0x12')]();importantStuff=null;}}
	
	//Zoom in/out
	speed		*= deltaTime * -moveSpeed;
	if (pressedKey[107] || pressedKey[61]) {	//+
		speed	*= deltaTime;
		radius	+= speed * 50;
	} else if (pressedKey[109] || pressedKey[173]) {	//-
		speed	*= deltaTime;
		radius	-= speed * 50;
	}

	//Spherical positions
	cameraTargetPos	= cameraCenterPos.clone().add((new THREE.Vector3(
		Math.cos(theta), Math.sin(phi), Math.sin(theta)
	)).multiplyScalar(radius));

	//Smooth moving to point where camera has to focus on
	camera.position.x	= lerp(camera.position.x, cameraTargetPos.x, deltaTime * 15);
	camera.position.y	= lerp(camera.position.y, cameraTargetPos.y, deltaTime * 15);
	camera.position.z	= lerp(camera.position.z, cameraTargetPos.z, deltaTime * 15);
	localGrid.position.set(
		Math.round(cameraCenterPos.x / spreadSize * 10) * spreadSize / 10,
		0.01 + Math.round(cameraCenterPos.y / spreadSize * 10) * spreadSize / 10,
		Math.round(cameraCenterPos.z / spreadSize * 10) * spreadSize / 10
	);
	//Smooth looking at focus point
	cameraFocusPos.set(
		lerp(cameraFocusPos.x, cameraCenterPos.x, deltaTime * 15),
		lerp(cameraFocusPos.y, cameraCenterPos.y, deltaTime * 15),
		lerp(cameraFocusPos.z, cameraCenterPos.z, deltaTime * 15)
	);
	camera.lookAt(cameraFocusPos);

	//Rendering
	renderer.render(scene, camera);

	//Frame update
	lastTime	= timer;
	window.requestAnimationFrame(update);
}

//If you don't understand this... it's mandatory due to HTML5 stuff.
window.onload = function() {
	init();
	update();
};