class ChunkManager {
	constructor(texture, scene, chunkData) {
		this.numberOfChunks = 1;
		this.chunks = [];

		for(let i = 0; i < this.numberOfChunks; i++) {
			this.chunks.push(new Chunk(chunkData));
		}

		this.chunkMeshes = [];
		var chunkMaterial = new THREE.MeshLambertMaterial( {map: texture});

		for(let i = 0; i < this.numberOfChunks; i++) {
			var currentChunk = this.chunks[i];

			var chunkGeometry = new THREE.BufferGeometry();
			chunkGeometry.addAttribute('position', new THREE.BufferAttribute(currentChunk.verticesArray,3));
			chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(currentChunk.normalsArray,3));
			chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(currentChunk.texCoordsArray,2));
			chunkGeometry.setIndex( new THREE.BufferAttribute(currentChunk.indexArray,1));
			chunkGeometry.drawRange = { start: 0, count: currentChunk.verticesCount }

			var layerMesh = new THREE.Mesh(chunkGeometry, chunkMaterial);
			this.chunkMeshes.push(layerMesh);
		}

		for(let i = 0; i < this.numberOfChunks; i++) {
			scene.add(this.chunkMeshes[i]);
		}		
	}
}