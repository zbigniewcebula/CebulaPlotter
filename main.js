var	container;
var	camera;
var	scene;
var	renderer;

var axes;
var grid;

var cameraTargetPos	= new THREE.Vector3(0, 0, 0);
var cameraCenterPos	= new THREE.Vector3(0, 0, 0);
var radius			= 50;
var xzPlaneAngle	= 0;
var yzPlaneAngle	= 0;

var mouse	= {
	x: 0,
	y: 0,
	relX: 0,
	relY: 0,
	deltaX: 0,
	deltaY: 0,
	button: false,
	wheel: 0
};

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
	console.log(mouse);
}
function onMouseDown(event) {
	mouse.button	= true;
}
function onMouseUp(event) {
	mouse.button	= false;
}
function onMouseWheel(event) {
	mouse.wheel	= ((event.deltaY || -event.wheelDelta || event.detail)) || 1;
	radius		+= mouse.wheel;
}

function onKeyDown(event) {
	var key		= event.which;
	
}

function init() {
	container	= document.getElementById('container');
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.98), 1, 1000);
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, (window.innerHeight * 0.98));
	container.appendChild(renderer.domElement);

	grid		= new THREE.GridHelper(1000, 100);
	axes		= new THREE.AxesHelper(1000);
	scene.add(axes);
	scene.add(grid);

	axes.position.set(0, 0.01, 0);

	var sphere;
	sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
	sphere.position.set(0, 0, 0);
	scene.add(sphere);

	container.addEventListener('mousedown', onMouseDown, false);
	container.addEventListener('mouseup', onMouseUp, false);
	container.addEventListener('mousemove', onMouseMove, false);

	container.addEventListener('wheel', onMouseWheel, false);
	container.addEventListener('mousewheel', onMouseWheel, false);
	container.addEventListener('DOMMouseScroll', onMouseWheel, false);

	container.addEventListener("keydown", onKeyDown, false);
}

var deltaTime	= 0;
var lastTime	= 0;
function update(timestamp) {
	var timer	= timestamp / 1000;
	deltaTime	= timer - lastTime;
	if (isNaN(deltaTime))	deltaTime = 0;

	if (mouse.button) {
		xzPlaneAngle	+= mouse.deltaX;
		yzPlaneAngle	+= mouse.deltaY;
	}

	cameraTargetPos	= new THREE.Vector3(
		cameraCenterPos.x + radius * Math.cos(xzPlaneAngle),
		cameraCenterPos.y + radius * Math.cos(yzPlaneAngle),
		cameraCenterPos.z + radius * Math.sin(xzPlaneAngle)
	);

	camera.position.x = lerp(camera.position.x, cameraTargetPos.x, deltaTime * 10);
	camera.position.y = lerp(camera.position.y, cameraTargetPos.y, deltaTime * 10);
	camera.position.z = lerp(camera.position.z, cameraTargetPos.z, deltaTime * 10);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	renderer.render(scene, camera);

	lastTime	= timer;
	window.requestAnimationFrame(update);
}


window.onload = function() {
	init();
	update();
};