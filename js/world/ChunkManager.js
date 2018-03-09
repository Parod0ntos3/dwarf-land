class ChunkManager {
	constructor(texture, scene, worldData) {
		this.worldData = worldData;

		this.chunks = [];

		this.chunkMeshes = [];
		this.slicedLayerMeshes = [];
		this.chunkMaterial = new THREE.MeshLambertMaterial( {map: texture} );
		this.slicedLayerMaterial = new THREE.MeshLambertMaterial( {color: "rgb(75,75,75)"} );

		this.indexOfCurrentLayer = this.worldData.chunkSize.y - 1;

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
				chunkGeometry.setDrawRange(0, chunk.indexCountPerLayer[this.indexOfCurrentLayer]);

				var chunkMesh = new THREE.Mesh(chunkGeometry, this.chunkMaterial);
				this.chunkMeshes.push(chunkMesh);

				scene.add(chunkMesh);
				
				var slicedLayerGeometry = new THREE.BufferGeometry();
				slicedLayerGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.sliceLayerVerticesArray,3));
				slicedLayerGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.sliceLayerNormalsArray,3));
				//slicedLayerGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.sliceLayerTexCoordsArray,2));
				slicedLayerGeometry.setIndex( new THREE.BufferAttribute(chunk.sliceLayerIndexArray,1));
				slicedLayerGeometry.setDrawRange(chunk.slicedLayerDrawRanges[this.indexOfCurrentLayer].start,
												 chunk.slicedLayerDrawRanges[this.indexOfCurrentLayer].count);

				var slicedLayerMesh = new THREE.Mesh(slicedLayerGeometry, this.slicedLayerMaterial);
				this.slicedLayerMeshes.push(slicedLayerMesh);

				scene.add(slicedLayerMesh);
			}
		}
	}

	update(mousePicker) {
		let coords = mousePicker.getSelectedCubeCoords();
		if(keyboard.wTipped && coords !== undefined) {
			this.changeWorldData(coords);
		}
		if(mousePicker.getIndexOfCurrentLayer() !== this.indexOfCurrentLayer) {
			this.indexOfCurrentLayer = mousePicker.getIndexOfCurrentLayer();
			this.updateDrawRangeOfChunkMeshes();
		}
		
	}


	updateDrawRangeOfChunkMeshes() {
		for(let i = 0; i < this.chunkMeshes.length; i++) {
			this.chunkMeshes[i].geometry.setDrawRange(0, this.chunks[i].indexCountPerLayer[this.indexOfCurrentLayer]);
			this.slicedLayerMeshes[i].geometry.setDrawRange(this.chunks[i].slicedLayerDrawRanges[this.indexOfCurrentLayer].start,
												 			this.chunks[i].slicedLayerDrawRanges[this.indexOfCurrentLayer].count);
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
			chunkGeometry.drawRange = { start: 0, count: chunk.indexCountPerLayer[this.indexOfCurrentLayer] }

			var chunkMesh = new THREE.Mesh(chunkGeometry, this.chunkMaterial);

			scene.remove(this.chunkMeshes[chunkIndexDataArray[i].chunkIndex]);
			this.chunkMeshes[chunkIndexDataArray[i].chunkIndex] = chunkMesh;
			scene.add(this.chunkMeshes[chunkIndexDataArray[i].chunkIndex]);

			var slicedLayerGeometry = new THREE.BufferGeometry();
			slicedLayerGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.sliceLayerVerticesArray,3));
			slicedLayerGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.sliceLayerNormalsArray,3));
			//slicedLayerGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.sliceLayerTexCoordsArray,2));
			slicedLayerGeometry.setIndex( new THREE.BufferAttribute(chunk.sliceLayerIndexArray,1));
			slicedLayerGeometry.setDrawRange(chunk.slicedLayerDrawRanges[this.indexOfCurrentLayer].start,
											 chunk.slicedLayerDrawRanges[this.indexOfCurrentLayer].count);

			var slicedLayerMesh = new THREE.Mesh(slicedLayerGeometry, this.slicedLayerMaterial);

			scene.remove(this.slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex]);
			this.slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex] = slicedLayerMesh;
			scene.add(this.slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex]);

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