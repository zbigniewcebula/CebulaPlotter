//All JS events that are mandatory to run this app
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
}
function onKeyUp(event) {
	event			= window.event? window.event: event;
	pressedKey[event.keyCode]		= false;
}