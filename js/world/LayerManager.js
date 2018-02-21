class LayerManager {
	constructor(texture, scene, worldData) {
		this.numberOfLayers = worldData.size.y;
		this.layers = [];

		for(let i = 0; i < this.numberOfLayers; i++) {
			this.layers.push(new Layer(i, worldData));
		}

		this.layerMeshes = [];
		var layerMaterial = new THREE.MeshLambertMaterial( {map: texture});

		for(let i = 0; i < this.numberOfLayers; i++) {
			var currentLayer = this.layers[i];

			var layerGeometry = new THREE.BufferGeometry();
			layerGeometry.addAttribute('position', new THREE.BufferAttribute(currentLayer.verticesArray,3));
			layerGeometry.addAttribute('normal', new THREE.BufferAttribute(currentLayer.normalsArray,3));
			layerGeometry.addAttribute('uv', new THREE.BufferAttribute(currentLayer.texCoordsArray,2));
			layerGeometry.setIndex( new THREE.BufferAttribute(currentLayer.indexArray,1));
			layerGeometry.drawRange = { start: 0, count: currentLayer.verticesCount }

			var layerMesh = new THREE.Mesh(layerGeometry, layerMaterial);
			this.layerMeshes.push(layerMesh);
		}

		for(let i = 0; i < this.numberOfLayers; i++) {
			scene.add(this.layerMeshes[i]);
		}		
	}
}