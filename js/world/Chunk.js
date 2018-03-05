class Chunk {
	constructor(worldData, chunkStartCoords) {
		this.CUBE_SIDE_LENGTH = 1;

		this.numOfVisibleFaces = this.getNumberOfVisibleFaces(worldData, chunkStartCoords);

		let verticesBuffer = new ArrayBuffer(4 * 12 * this.numOfVisibleFaces);
		let normalsBuffer = new ArrayBuffer(4 * 12 * this.numOfVisibleFaces);
		let texCoordsBuffer = new ArrayBuffer(4 * 8 * this.numOfVisibleFaces);
		let indexBuffer = new ArrayBuffer(4 * 6 * this.numOfVisibleFaces);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.verticesCount = 0;
		this.verticesCountPerLayer = [];

		this.inizializeVertexBufferObjects(worldData, chunkStartCoords);
	}

	getNumberOfVisibleFaces(worldData, chunkStartCoords) {
		let numberOfVisibleFaces = 0;
		for(let y = 0; y < worldData.chunkSize.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + worldData.chunkSize.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + worldData.chunkSize.z; z++) {
					let cubeType = worldData.getCubeType([x,y,z]);

					// If cubeType !== worldData.CUBE_TYPE_AIR, check if cube is visible
					if(cubeType !== worldData.CUBE_TYPE_AIR && cubeType !== worldData.CUBE_TYPE_WATER) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = worldData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== worldData.CUBE_TYPE_AIR
							if((neighborsTypes[i] !== worldData.CUBE_TYPE_AIR && 
								neighborsTypes[i] !== worldData.CUBE_TYPE_WATER)||
							   neighborsTypes[i] === worldData.CUBE_TYPE_OUTSIDE_WORLD) {
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

	inizializeVertexBufferObjects(worldData, chunkStartCoords) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let indexCounter = 0;
		for(let y = 0; y < worldData.chunkSize.y; y++) {
			for(let x = chunkStartCoords.x; x < chunkStartCoords.x + worldData.chunkSize.x; x++) {
				for(let z = chunkStartCoords.z; z < chunkStartCoords.z + worldData.chunkSize.z; z++) {
					let cubeType = worldData.getCubeType([x,y,z]);

					// If cubeType !== worldData.CUBE_TYPE_AIR, check if cube is visible
					if(cubeType !== worldData.CUBE_TYPE_AIR && cubeType !== worldData.CUBE_TYPE_WATER) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = worldData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== worldData.CUBE_TYPE_AIR
							if((neighborsTypes[i] !== worldData.CUBE_TYPE_AIR && 
								neighborsTypes[i] !== worldData.CUBE_TYPE_WATER) ||
							   neighborsTypes[i] === worldData.CUBE_TYPE_OUTSIDE_WORLD) {
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
			this.verticesCountPerLayer.push(arrayIndex * 6);
		}
		this.verticesCount = arrayIndex * 6;
	}
}