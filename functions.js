//Lovely lerp to run things smooth
function lerp(a, b, t) {
	return a + t * (b - a);
}

//Prevention of spamming same log lines
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
