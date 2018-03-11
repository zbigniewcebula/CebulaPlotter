var	container;
var	camera;
var	scene;
var	renderer;

var axesHelper;
var grid;

function init() {
	container	= document.getElementById('container');
	camera		= new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	scene		= new THREE.Scene();
	renderer	= new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	grid		= new THREE.GridHelper(100, 10);
	axesHelper	= new THREE.AxesHelper(20);
	scene.add(axesHelper);
	scene.add(grid);

	camera.position.y = 0;
	camera.position.z = 10;
}

function update(timestamp) {


	renderer.render(scene, camera);
	window.requestAnimationFrame(update);
}


window.onload = function() {
	init();
	update();
};