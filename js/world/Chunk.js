class Chunk {
	constructor(worldData, chunkStartCoords) {
		this.CUBE_SIDE_LENGTH = 1;

		let verticesBuffer = new ArrayBuffer(4 * 12 * 6 * worldData.numberOfCubesPerChunk);
		let normalsBuffer = new ArrayBuffer(4 * 12 * 6 * worldData.numberOfCubesPerChunk);
		let texCoordsBuffer = new ArrayBuffer(4 * 8 * 6 * worldData.numberOfCubesPerChunk);
		let indexBuffer = new ArrayBuffer(4 * 12 * 3 * worldData.numberOfCubesPerChunk);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.verticesCount = 0;

		this.inizializeVertexBufferObjects(worldData, chunkStartCoords);		
	}

	inizializeVertexBufferObjects(worldData, chunkStartCoords) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let indexCounter = 0;
		for(let x = chunkStartCoords.x; x < chunkStartCoords.x + worldData.chunkSize.x; x++) {
			for(let z = chunkStartCoords.z; z < chunkStartCoords.z + worldData.chunkSize.z; z++) {
				for(let y = 0; y < worldData.chunkSize.y; y++) {
					let cubeType = worldData.getCubeType([x,y,z]);

					// If cubeType !== worldData.CUBE_TYPE_AIR, check if cube is visible
					if(cubeType !== worldData.CUBE_TYPE_AIR) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = worldData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== worldData.CUBE_TYPE_AIR
							if(neighborsTypes[i] !== worldData.CUBE_TYPE_AIR) {
								faceIsVisibleArray[i] = false;
							} else {
								faceIsVisibleArray[i] = true;
								numberOfVisibleFaces++;
							}
						}

						cube.setPosition([x - worldData.worldSize.x / 2,
										  y - worldData.worldSize.y / 2,
										  z - worldData.worldSize.z / 2]);

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
		}
		this.verticesCount = arrayIndex * 6;
	}
}