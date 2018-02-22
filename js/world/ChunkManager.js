class ChunkManager {
	constructor(texture, scene, worldData) {
		this.chunks = [];

		this.chunkMeshes = [];
		var chunkMaterial = new THREE.MeshLambertMaterial( {map: texture});

		for(let x_Chunk = 0; x_Chunk < worldData.numberOfChunks.x; x_Chunk++) {
			for(let z_Chunk = 0; z_Chunk < worldData.numberOfChunks.z; z_Chunk++) {
				let chunkStartCoords = {x: x_Chunk * worldData.chunkSize.x, 
										y: 0,
										z: z_Chunk * worldData.chunkSize.z};

				let chunk = new Chunk(worldData, chunkStartCoords);
				this.chunks.push(chunk);

				var chunkGeometry = new THREE.BufferGeometry();
				chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.verticesArray,3));
				chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.normalsArray,3));
				chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.texCoordsArray,2));
				chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.indexArray,1));
				chunkGeometry.drawRange = { start: 0, count: chunk.verticesCount }

				var layerMesh = new THREE.Mesh(chunkGeometry, chunkMaterial);
				this.chunkMeshes.push(layerMesh);

				scene.add(layerMesh);
			}
		}
	}
}