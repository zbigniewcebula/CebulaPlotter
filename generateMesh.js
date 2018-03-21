function generateMesh(colorIndex) {
	//Removing OLD
	if (wireframe[colorIndex] != null) {
		var	toRemove		= wireframe[colorIndex];
		toRemove.visible	= false;
		toRemove.material.dispose();
		toRemove.geometry.dispose();
		scene.remove(toRemove.mesh);
		toRemove.mesh		= null;
		
		wireframe[colorIndex]	= null;

		addLogEntry("MeshGeneration", "Removed generated mesh! [" + colorIndex + "]");
		return;
	}
	wireframe[colorIndex]	= null;

	//Creation
	var geo				= new THREE.Geometry();

	//Colecting da pointz
	var	points	= new Array();
	for(var i = 0; i < parsedData.length; ++i) {
		if (parsedData[i].mesh.clrIndex == colorIndex) {
			geo.vertices.push(
				parsedData[i].mesh.position
			);
			points.push(new THREE.Vector3(parsedData[i].mesh.position));
			points[points.length - 1].y	= 0;
		}
	}

	//Triangulation
	if (points.length > 2) {
		var holes		= [];
		var triangles	= THREE.ShapeUtils.triangulateShape(points, holes);

		//Creating faces
		for(var i = 0; i < triangles.length; ++i) {
			geo.faces.push(new THREE.Face3(
				triangles[i][0],
				triangles[i][1],
				triangles[i][2]
			));
		}

		//Adding object to scene
		var _geo					= new THREE.EdgesGeometry(geo);
		var mat						= new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
		mat.color					= parsedPalette[colorIndex];
		wireframe[colorIndex]		= new THREE.LineSegments(_geo, mat);
		wireframe[colorIndex].name	= "GENERATED_" + colorIndex;
		scene.add(wireframe[colorIndex]);
		
		addLogEntry("MeshGeneration", "Successfully generated mesh from points! [" + colorIndex + "]");
	} else {
		addLogEntry("MeshGeneration", "Fail, no points to create a mesh! [" + colorIndex + "]");
	}
}