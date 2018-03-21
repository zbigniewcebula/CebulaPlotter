//THREE
	//Main
var	container;
var	camera;
var moveSpeed;
var	scene;
var	renderer;
var raycaster;
	//Objs
var axes;
var grid;
var localGrid;

//Hehe
var importantStuff;
var importantStuffX;
var importantTimer;

//Movement
var cameraTargetPos;
var cameraCenterPos;
var cameraFocusPos;
var radius;
var theta;
var phi;

//Input
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

//Data
	//Parsed files
var parsedData		= null;
var parsedPalette	= null;

	//Collection of raycastable objects
var raycastable		= null;
	
	//Mesh from data
var wireframe		= {};

//Adjustment
var spreadSize	= 0;
var	scaleFactor	= 0.1;

//Log
var logEntries	= new Array();
var lastLogHash	= 0;