class Chunk {
	constructor(voxelTypesData, chunkStartCoords) {
		this.CUBE_SIDE_LENGTH = 1;

		// Initialize world vbos:
		this.numOfVisibleFaces = this.getNumberOfVisibleFaces(voxelTypesData, chunkStartCoords);

		let verticesBuffer = new ArrayBuffer(4 * 12 * this.numOfVisibleFaces);
		let normalsBuffer = new ArrayBuffer(4 * 12 * this.numOfVisibleFaces);
		let texCoordsBuffer = new ArrayBuffer(4 * 8 * this.numOfVisibleFaces);
		let indexBuffer = new ArrayBuffer(4 * 6 * this.numOfVisibleFaces);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.indexCount = 0;
		this.indexCountPerLayer = [];

		this.inizializeVertexBufferObjects(voxelTypesData, chunkStartCoords);

		// Initialize sliceLayer vbos:
		this.slicedLayerDrawRanges = [];

		this.numberOfSlicedCubes = this.getNumberOfSlicedCubes(voxelTypesData, chunkStartCoords);

		let sliceLayerVerticesBuffer = new ArrayBuffer(4 * 12 * this.numberOfSlicedCubes);
		let sliceLayerNormalsBuffer = new ArrayBuffer(4 * 12 * this.numberOfSlicedCubes);
		let sliceLayerTexCoordsBuffer = new ArrayBuffer(4 * 8 * this.numberOfSlicedCubes);
		let sliceLayerIndexBuffer = new ArrayBuffer(4 * 6 * this.numberOfSlicedCubes);

		this.sliceLayerVerticesArray = new Float32Array(sliceLayerVerticesBuffer);
		this.sliceLayerNormalsArray = new Float32Array(sliceLayerNormalsBuffer);
		this.sliceLayerTexCoordsArray = new Float32Array(sliceLayerTexCoordsBuffer);
		this.sliceLayerIndexArray = new Uint32Array(sliceLayerIndexBuffer);

		this.initializeSliceLayerVertexBufferObjects(voxelTypesData, chunkStartCoords);

	}

	getNumberOfSlicedCubes(voxelTypesData, chunkStartCoords) {
		let numberOfSlicedCubes = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let cubeType = voxelTypesData.getVoxelType([x,y,z]);
					if(cubeType !== VOXEL_TYPE.AIR && cubeType !== VOXEL_TYPE.WATER) {
						numberOfSlicedCubes++;
					}					
				}
			}
		}
		return numberOfSlicedCubes;
	}

	initializeSliceLayerVertexBufferObjects(voxelTypesData, chunkStartCoords) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);

		let numberOfSlicedCubes = 0;
		let indexCounter = 0;

		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			let startIndex = numberOfSlicedCubes * 6;
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let cubeType = voxelTypesData.getVoxelType([x,y,z]);

					if(cubeType !== VOXEL_TYPE.AIR && cubeType !== VOXEL_TYPE.WATER) {
						let faceIsVisibleArray = [false, false, false, false, true, false];

						cube.setPosition([x,y,z]);
						cube.setTexOffset([5, 0]);
						cube.setFaceVisibility(faceIsVisibleArray);

						this.sliceLayerVerticesArray.set(cube.getGeometry(), numberOfSlicedCubes * 12);
						this.sliceLayerNormalsArray.set(cube.getNormals(), numberOfSlicedCubes * 12);
						this.sliceLayerTexCoordsArray.set(cube.getTexCoords(), numberOfSlicedCubes * 8);

						let indices = cube.getIndices();
						for(let i = 0; i < indices.length; i++) {
							indices[i] += indexCounter;
						}
						indexCounter += (indices.length / 6) * 4;
						this.sliceLayerIndexArray.set(new Float32Array(indices), numberOfSlicedCubes * 6);

						numberOfSlicedCubes++;
					}					
				}
			}
			let endIndex = numberOfSlicedCubes * 6;
			this.slicedLayerDrawRanges.push({start: startIndex, count: endIndex - startIndex});
		}
	}

	getNumberOfVisibleFaces(voxelTypesData, chunkStartCoords) {
		let numberOfVisibleFaces = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let cubeType = voxelTypesData.getVoxelType([x,y,z]);

					// If cubeType !== VOXEL_TYPE.AIR, check if cube is visible
					if(cubeType !== VOXEL_TYPE.AIR && cubeType !== VOXEL_TYPE.WATER) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = voxelTypesData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== VOXEL_TYPE.AIR
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

	inizializeVertexBufferObjects(voxelTypesData, chunkStartCoords) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let indexCounter = 0;
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + CHUNK_SIZE.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + CHUNK_SIZE.z; z++) {
					let cubeType = voxelTypesData.getVoxelType([x,y,z]);

					// If cubeType !== VOXEL_TYPE.AIR, check if cube is visible
					if(cubeType !== VOXEL_TYPE.AIR && cubeType !== VOXEL_TYPE.WATER) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = voxelTypesData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== VOXEL_TYPE.AIR
							if((neighborsTypes[i] !== VOXEL_TYPE.AIR && 
								neighborsTypes[i] !== VOXEL_TYPE.WATER) ||
							   neighborsTypes[i] === VOXEL_TYPE.OUTSIDE_WORLD) {
								faceIsVisibleArray[i] = false;
							} else {
								faceIsVisibleArray[i] = true;
								numberOfVisibleFaces++;
							}
						}

						cube.setPosition([x,y,z]);

						cube.setTexOffset([cubeType, 0]);

						cube.setFaceVisibility(faceIsVisibleArray);

						this.verticesArray.set(cube.getGeometry(), arrayIndex * 12);
						this.normalsArray.set(cube.getNormals(), arrayIndex * 12);
						this.texCoordsArray.set(cube.getTexCoords(), arrayIndex * 8);

						let indices = cube.getIndices();
						for(let i = 0; i < indices.length; i++) {
							indices[i] += indexCounter;
						}
						indexCounter += (indices.length / 6) * 4;
						this.indexArray.set(new Float32Array(indices), arrayIndex * 6);

						arrayIndex += numberOfVisibleFaces;
					}
				}
			}
			this.indexCountPerLayer.push(arrayIndex * 6);
		}
		this.indexCount = arrayIndex * 6;
	}
}