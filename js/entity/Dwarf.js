class Dwarf {
	constructor(scene, worldData) {
		// Initialize mesh
		var dwarfGeometry = new THREE.BoxGeometry( 1, 1.5, 1 );
		var dwarfMaterial = new THREE.MeshBasicMaterial( {color: "rgb(200, 0, 200)"} );
		this.dwarfMesh = new THREE.Mesh( dwarfGeometry, dwarfMaterial );
		scene.add( this.dwarfMesh );

		// Set start position
		let startCoords = [Math.floor(worldData.worldSize.x / 2), 0, Math.floor(worldData.worldSize.z / 2)];
		startCoords[1] = worldData.getHeight(startCoords[0], startCoords[2]);
		this.dwarfMesh.position.x = startCoords[0];
		this.dwarfMesh.position.y = startCoords[1] + 0.25;
		this.dwarfMesh.position.z = startCoords[2];
	}

	update(targetCoords) {
		if(targetCoords != null) {
			/*this.dwarfMesh.position.x = targetCoords[0];
			this.dwarfMesh.position.y = targetCoords[1];
			this.dwarfMesh.position.z = targetCoords[2];*/
		}
	}
}