class Chunk {
	constructor(voxelTypesData, chunkStartCoords) {
		// Initialize world vbos:
		this._numOfVisibleFaces = this._getNumberOfVisibleFaces(voxelTypesData, chunkStartCoords);

		let verticesBuffer = new ArrayBuffer(4 * 12 * this._numOfVisibleFaces);
		let normalsBuffer = new ArrayBuffer(4 * 12 * this._numOfVisibleFaces);
		let texCoordsBuffer = new ArrayBuffer(4 * 8 * this._numOfVisibleFaces);
		let indexBuffer = new ArrayBuffer(4 * 6 * this._numOfVisibleFaces);

		this._verticesArray = new Float32Array(verticesBuffer);
		this._normalsArray = new Float32Array(normalsBuffer);
		this._texCoordsArray = new Float32Array(texCoordsBuffer);
		this._indexArray = new Uint32Array(indexBuffer);

		this._indexCount = 0;
		this._indexCountPerLayer = [];

		this._inizializeVertexBufferObjects(voxelTypesData, chunkStartCoords);

		// Initialize sliceLayer vbos:
		this._slicedLayerDrawRanges = [];

		this._numberOfSlicedVoxels = this._getNumberOfSlicedVoxels(voxelTypesData, chunkStartCoords);

		let sliceLayerVerticesBuffer = new ArrayBuffer(4 * 12 * this._numberOfSlicedVoxels);
		let sliceLayerNormalsBuffer = new ArrayBuffer(4 * 12 * this._numberOfSlicedVoxels);
		let sliceLayerTexCoordsBuffer = new ArrayBuffer(4 * 8 * this._numberOfSlicedVoxels);
		let sliceLayerIndexBuffer = new ArrayBuffer(4 * 6 * this._numberOfSlicedVoxels);

		this._sliceLayerVerticesArray = new Float32Array(sliceLayerVerticesBuffer);
		this._sliceLayerNormalsArray = new Float32Array(sliceLayerNormalsBuffer);
		this._sliceLayerTexCoordsArray = new Float32Array(sliceLayerTexCoordsBuffer);
		this._sliceLayerIndexArray = new Uint32Array(sliceLayerIndexBuffer);

		this._initializeSliceLayerVertexBufferObjects(voxelTypesData, chunkStartCoords);

	}

	// Public methods:

	getVerticesArray() {
		return this._verticesArray;
	}

	getNormalsArray() {
		return this._normalsArray;
	}
	getTexCoordsArray() {
		return this._texCoordsArray;
	}

	getIndexArray() {
		return this._indexArray;
	}

	getSliceLayerVerticesArray() {
		return this._sliceLayerVerticesArray;
	}

	getSliceLayerNormalsArray() {
		return this._sliceLayerNormalsArray;
	}

	getSliceLayerTexCoordsArray() {
		return this._sliceLayerTexCoordsArray;
	}

	getSliceLayerIndexArray() {
		return this._sliceLayerIndexArray;
	}

	getIndexCountPerLayerByIndex(index) {
		return this._indexCountPerLayer[index];
	}

	getSlicedLayerDrawRangeByIndex(index) {
		return this._slicedLayerDrawRanges[index];
	}

	// Private methods:

	_getNumberOfSlicedVoxels(voxelTypesData, chunkStartCoords) {
		let numberOfSlicedVoxels = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let voxelType = voxelTypesData.getVoxelType([x,y,z]);
					if(voxelType !== VOXEL_TYPE.AIR && voxelType !== VOXEL_TYPE.WATER) {
						numberOfSlicedVoxels++;
					}					
				}
			}
		}
		return numberOfSlicedVoxels;
	}

	_initializeSliceLayerVertexBufferObjects(voxelTypesData, chunkStartCoords) {
		let voxel = new Voxel(VOXEL_SIDE_LENGTH);

		let numberOfSlicedVoxels = 0;
		let indexCounter = 0;

		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			let startIndex = numberOfSlicedVoxels * 6;
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let voxelType = voxelTypesData.getVoxelType([x,y,z]);

					if(voxelType !== VOXEL_TYPE.AIR && voxelType !== VOXEL_TYPE.WATER) {
						let faceIsVisibleArray = [false, false, false, false, true, false];

						voxel.setPosition([x,y,z]);
						voxel.setTexOffset([5, 0]);
						voxel.setFaceVisibility(faceIsVisibleArray);

						this._sliceLayerVerticesArray.set(voxel.getGeometry(), numberOfSlicedVoxels * 12);
						this._sliceLayerNormalsArray.set(voxel.getNormals(), numberOfSlicedVoxels * 12);
						this._sliceLayerTexCoordsArray.set(voxel.getTexCoords(), numberOfSlicedVoxels * 8);

						let indices = voxel.getIndices();
						for(let i = 0; i < indices.length; i++) {
							indices[i] += indexCounter;
						}
						indexCounter += (indices.length / 6) * 4;
						this._sliceLayerIndexArray.set(new Float32Array(indices), numberOfSlicedVoxels * 6);

						numberOfSlicedVoxels++;
					}					
				}
			}
			let endIndex = numberOfSlicedVoxels * 6;
			this._slicedLayerDrawRanges.push({start: startIndex, count: endIndex - startIndex});
		}
	}

	_getNumberOfVisibleFaces(voxelTypesData, chunkStartCoords) {
		let numberOfVisibleFaces = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let voxelType = voxelTypesData.getVoxelType([x,y,z]);

					// If voxelType !== VOXEL_TYPE.AIR, check if voxel is visible
					if(voxelType !== VOXEL_TYPE.AIR && voxelType !== VOXEL_TYPE.WATER) {

						// Get the types of the 6 neighbor-voxels
						let neighborsTypes = voxelTypesData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor voxel is solid
						for(let i = 0; i < 6; i++) {
							// Check if voxelType of neighbor !== VOXEL_TYPE.AIR
							if((neighborsTypes[i] !== VOXEL_TYPE.AIR && 
								neighborsTypes[i] !== VOXEL_TYPE.WATER)||
							   neighborsTypes[i] === VOXEL_TYPE.OUTSIDE_WORLD) {
							} else {
								numberOfVisibleFaces++;
							}
						}
					}
				}
			}
		}
		return numberOfVisibleFaces;
	}

	_inizializeVertexBufferObjects(voxelTypesData, chunkStartCoords) {
		let voxel = new Voxel(VOXEL_SIDE_LENGTH);
		let arrayIndex = 0;
		let indexCounter = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let voxelType = voxelTypesData.getVoxelType([x,y,z]);

					// If voxelType !== VOXEL_TYPE.AIR, check if voxel is visible
					if(voxelType !== VOXEL_TYPE.AIR && voxelType !== VOXEL_TYPE.WATER) {

						// Get the types of the 6 neighbor-voxels
						let neighborsTypes = voxelTypesData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor voxel is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if voxelType of neighbor !== VOXEL_TYPE.AIR
							if((neighborsTypes[i] !== VOXEL_TYPE.AIR && 
								neighborsTypes[i] !== VOXEL_TYPE.WATER) ||
							   neighborsTypes[i] === VOXEL_TYPE.OUTSIDE_WORLD) {
								faceIsVisibleArray[i] = false;
							} else {
								faceIsVisibleArray[i] = true;
								numberOfVisibleFaces++;
							}
						}

						voxel.setPosition([x,y,z]);

						voxel.setTexOffset([voxelType, 0]);

						voxel.setFaceVisibility(faceIsVisibleArray);

						this._verticesArray.set(voxel.getGeometry(), arrayIndex * 12);
						this._normalsArray.set(voxel.getNormals(), arrayIndex * 12);
						this._texCoordsArray.set(voxel.getTexCoords(), arrayIndex * 8);

						let indices = voxel.getIndices();
						for(let i = 0; i < indices.length; i++) {
							indices[i] += indexCounter;
						}
						indexCounter += (indices.length / 6) * 4;
						this._indexArray.set(new Float32Array(indices), arrayIndex * 6);

						arrayIndex += numberOfVisibleFaces;
					}
				}
			}
			this._indexCountPerLayer.push(arrayIndex * 6);
		}
		this._indexCount = arrayIndex * 6;
	}
}