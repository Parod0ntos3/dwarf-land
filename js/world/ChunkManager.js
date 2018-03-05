class ChunkManager {
	constructor(texture, scene, worldData) {
		this.worldData = worldData;

		this.chunks = [];

		this.chunkMeshes = [];
		this.chunkMaterial = new THREE.MeshLambertMaterial( {map: texture} );

		for(let x_Chunk = 0; x_Chunk < this.worldData.numberOfChunks.x; x_Chunk++) {
			for(let z_Chunk = 0; z_Chunk < this.worldData.numberOfChunks.z; z_Chunk++) {
				let chunkStartCoords = {x: x_Chunk * this.worldData.chunkSize.x, 
										y: 0,
										z: z_Chunk * this.worldData.chunkSize.z};

				let chunk = new Chunk(this.worldData, chunkStartCoords);
				this.chunks.push(chunk);

				var chunkGeometry = new THREE.BufferGeometry();
				chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.verticesArray,3));
				chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.normalsArray,3));
				chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.texCoordsArray,2));
				chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.indexArray,1));
				chunkGeometry.drawRange = { start: 0, count: chunk.verticesCount }

				var layerMesh = new THREE.Mesh(chunkGeometry, this.chunkMaterial);
				this.chunkMeshes.push(layerMesh);

				scene.add(layerMesh);
			}
		}
	}

	update(mousePicker, scene) {
		let coords = mousePicker.getSelectedCubeCoords();
		if(keyboard.wTipped && coords !== null) {
			this.changeWorldData(coords);
		}
	}

	changeWorldData(coords) {
		this.worldData.updateWorldData(coords, this.worldData.CUBE_TYPE_AIR);

		let chunkIndexDataArray = this.getChunkIndexDataOfNeighborsByWorldCoords(coords);
		for(let i = 0; i < chunkIndexDataArray.length; i++) {
			let chunkStartCoords = {x: chunkIndexDataArray[i].x_Chunk * this.worldData.chunkSize.x, 
									y: 0,
									z: chunkIndexDataArray[i].z_Chunk * this.worldData.chunkSize.z};

			let chunk = new Chunk(this.worldData, chunkStartCoords);
			this.chunks[chunkIndexDataArray[i].chunkIndex] = chunk;

			var chunkGeometry = new THREE.BufferGeometry();
			chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.verticesArray,3));
			chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.normalsArray,3));
			chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.texCoordsArray,2));
			chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.indexArray,1));
			chunkGeometry.drawRange = { start: 0, count: chunk.verticesCount }

			var layerMesh = new THREE.Mesh(chunkGeometry, this.chunkMaterial);

			scene.remove(this.chunkMeshes[chunkIndexDataArray[i].chunkIndex]);
			this.chunkMeshes[chunkIndexDataArray[i].chunkIndex] = layerMesh;
			scene.add(this.chunkMeshes[chunkIndexDataArray[i].chunkIndex]);

			console.log("updated chunk " + chunkIndexDataArray[i].chunkIndex);
		}
	}

	getChunkIndexDataOfNeighborsByWorldCoords(coords) {
		let chunkIndexDataArray = [];

		let neighborCoords = [
			[coords[0] + 1, coords[1], coords[2] + 1],
			[coords[0] + 1, coords[1], coords[2] - 1],
			[coords[0] - 1, coords[1], coords[2] + 1],
			[coords[0] - 1, coords[1], coords[2] - 1],
		];

		for(let i = 0; i < neighborCoords.length; i++) {
			let chunkIndexData = this.getChunkIndexDataByWorldCoords(neighborCoords[i]);
			let chunkIndexInArray = false;
			for(let j = 0; j < chunkIndexDataArray.length; j++) {
				if(chunkIndexDataArray[j].chunkIndex === chunkIndexData.chunkIndex) {
					chunkIndexInArray = true;
					break;
				}
			}
			if(chunkIndexInArray === false)
				chunkIndexDataArray.push(chunkIndexData);
		}

		return chunkIndexDataArray;
	}

	getChunkIndexDataByWorldCoords(coords) {
		let x_Chunk = Math.floor(coords[0] / this.worldData.chunkSize.x);
		let z_Chunk = Math.floor(coords[2] / this.worldData.chunkSize.z);

		let chunkIndex = x_Chunk * this.worldData.numberOfChunks.z + z_Chunk;
		return {chunkIndex : chunkIndex, x_Chunk: x_Chunk, z_Chunk : z_Chunk};
	}
}