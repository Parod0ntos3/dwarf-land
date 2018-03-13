class ChunkManager {
	constructor(texture, scene, voxelTypesData, worldManager) {
		this._voxelTypesData = voxelTypesData;
		this._worldManager = worldManager;

		this._chunks = [];

		this._chunkMeshes = [];
		this._slicedLayerMeshes = [];
		this._chunkMaterial = new THREE.MeshLambertMaterial( {map: texture} );
		this._slicedLayerMaterial = new THREE.MeshLambertMaterial( {color: "rgb(75,75,75)"} );

		this._indexOfCurrentLayer = WORLD_SIZE.y - 1;

		this._initializeMeshes(scene);
	}

	// Public methods:

	update(mousePicker) {
		let coords = mousePicker.getSelectedVoxelCoords();
		if(keyboard.wTipped && coords !== undefined) {
			this._worldManager.removeMinedVoxel(coords);
			this.changeWorldData(coords);
		}
		if(mousePicker.getIndexOfCurrentLayer() !== this._indexOfCurrentLayer) {
			this._indexOfCurrentLayer = mousePicker.getIndexOfCurrentLayer();
			this._updateDrawRangeOfChunkMeshes();
		}	
	}

	changeWorldData(coords) {
		let chunkIndexDataArray = this._getChunkIndexDataOfNeighborsByWorldCoords(coords);
		for(let i = 0; i < chunkIndexDataArray.length; i++) {
			let chunkStartCoords = {x: chunkIndexDataArray[i].x_Chunk * CHUNK_SIZE.x, 
									y: 0,
									z: chunkIndexDataArray[i].z_Chunk * CHUNK_SIZE.z};

			let chunk = new Chunk(this._voxelTypesData, chunkStartCoords);
			this._chunks[chunkIndexDataArray[i].chunkIndex] = chunk;

			var chunkGeometry = new THREE.BufferGeometry();
			chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.getVerticesArray(),3));
			chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.getNormalsArray(),3));
			chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.getTexCoordsArray(),2));
			chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.getIndexArray(),1));
			chunkGeometry.drawRange = { start: 0, count: chunk.getIndexCountPerLayerByIndex(this._indexOfCurrentLayer) }

			var chunkMesh = new THREE.Mesh(chunkGeometry, this._chunkMaterial);

			scene.remove(this._chunkMeshes[chunkIndexDataArray[i].chunkIndex]);
			this._chunkMeshes[chunkIndexDataArray[i].chunkIndex] = chunkMesh;
			scene.add(this._chunkMeshes[chunkIndexDataArray[i].chunkIndex]);

			var slicedLayerGeometry = new THREE.BufferGeometry();
			slicedLayerGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.getSliceLayerVerticesArray(),3));
			slicedLayerGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.getSliceLayerNormalsArray(),3));
			//slicedLayerGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.sliceLayerTexCoordsArray,2));
			slicedLayerGeometry.setIndex( new THREE.BufferAttribute(chunk.getSliceLayerIndexArray(),1));
			slicedLayerGeometry.setDrawRange(chunk.getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).start,
											 chunk.getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).count);

			var slicedLayerMesh = new THREE.Mesh(slicedLayerGeometry, this._slicedLayerMaterial);

			scene.remove(this._slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex]);
			this._slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex] = slicedLayerMesh;
			scene.add(this._slicedLayerMeshes[chunkIndexDataArray[i].chunkIndex]);

			console.log("updated chunk " + chunkIndexDataArray[i].chunkIndex);
		}
	}

	//Private methods:

	_initializeMeshes(scene) {
		for(let x_Chunk = 0; x_Chunk < NUMBER_OF_CHUNKS.x; x_Chunk++) {
			for(let z_Chunk = 0; z_Chunk < NUMBER_OF_CHUNKS.z; z_Chunk++) {
				let chunkStartCoords = {x: x_Chunk * CHUNK_SIZE.x, 
										y: 0,
										z: z_Chunk * CHUNK_SIZE.z};

				let chunk = new Chunk(this._voxelTypesData, chunkStartCoords);
				this._chunks.push(chunk);

				var chunkGeometry = new THREE.BufferGeometry();
				chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.getVerticesArray(),3));
				chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.getNormalsArray(),3));
				chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.getTexCoordsArray(),2));
				chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.getIndexArray(),1));
				chunkGeometry.setDrawRange(0, chunk.getIndexCountPerLayerByIndex(this._indexOfCurrentLayer));

				var chunkMesh = new THREE.Mesh(chunkGeometry, this._chunkMaterial);
				this._chunkMeshes.push(chunkMesh);

				scene.add(chunkMesh);
				
				var slicedLayerGeometry = new THREE.BufferGeometry();
				slicedLayerGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.getSliceLayerVerticesArray(),3));
				slicedLayerGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.getSliceLayerNormalsArray(),3));
				//slicedLayerGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.sliceLayerTexCoordsArray,2));
				slicedLayerGeometry.setIndex( new THREE.BufferAttribute(chunk.getSliceLayerIndexArray(),1));
				slicedLayerGeometry.setDrawRange(chunk.getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).start,
												 chunk.getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).count);

				var slicedLayerMesh = new THREE.Mesh(slicedLayerGeometry, this._slicedLayerMaterial);
				this._slicedLayerMeshes.push(slicedLayerMesh);

				scene.add(slicedLayerMesh);
			}
		}		
	}

	_updateDrawRangeOfChunkMeshes() {
		for(let i = 0; i < this._chunkMeshes.length; i++) {
			this._chunkMeshes[i].geometry.setDrawRange(0, this._chunks[i].getIndexCountPerLayer()[this._indexOfCurrentLayer]);
			this._slicedLayerMeshes[i].geometry.setDrawRange(this._chunks[i].getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).start,
												 			this._chunks[i].getSlicedLayerDrawRangeByIndex(this._indexOfCurrentLayer).count);
		}
	}

	_getChunkIndexDataOfNeighborsByWorldCoords(coords) {
		let chunkIndexDataArray = [];

		let neighborCoords = [
			[coords[0] + 1, coords[1], coords[2] + 1],
			[coords[0] + 1, coords[1], coords[2] - 1],
			[coords[0] - 1, coords[1], coords[2] + 1],
			[coords[0] - 1, coords[1], coords[2] - 1],
		];

		for(let i = 0; i < neighborCoords.length; i++) {
			let chunkIndexData = this._getChunkIndexDataByWorldCoords(neighborCoords[i]);
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

	_getChunkIndexDataByWorldCoords(coords) {
		let x_Chunk = Math.floor(coords[0] / CHUNK_SIZE.x);
		let z_Chunk = Math.floor(coords[2] / CHUNK_SIZE.z);

		let chunkIndex = x_Chunk * NUMBER_OF_CHUNKS.z + z_Chunk;
		return {chunkIndex : chunkIndex, x_Chunk: x_Chunk, z_Chunk : z_Chunk};
	}
}