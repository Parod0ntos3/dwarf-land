class Chunk {
	constructor(chunkData) {
		this.CUBE_SIDE_LENGTH = 1;

		this.chunkSize = {x: chunkData.size.x, y: chunkData.size.y, z: chunkData.size.z};
		this.numberOfCubesPerChunk = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;

		let verticesBuffer = new ArrayBuffer(4 * 12 * 6 * this.numberOfCubesPerChunk);
		let normalsBuffer = new ArrayBuffer(4 * 12 * 6 * this.numberOfCubesPerChunk);
		let texCoordsBuffer = new ArrayBuffer(4 * 8 * 6 * this.numberOfCubesPerChunk);
		let indexBuffer = new ArrayBuffer(4 * 12 * 3 * this.numberOfCubesPerChunk);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.verticesCount = 0;

		this.inizializeVertexBufferObjects(chunkData);		
	}

	inizializeVertexBufferObjects(chunkData) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let indexCounter = 0;
		for(let x = 0; x < this.chunkSize.x; x++) {
			for(let y = 0; y < this.chunkSize.y; y++) {
				for(let z = 0; z < this.chunkSize.z; z++) {
					let index = chunkData.getIndexFromCoordinates([x,y,z]);

					// If cubeType !== chunkData.CUBE_TYPE_AIR, check if cube is visible
					if(chunkData.cubeTypes[index] !== chunkData.CUBE_TYPE_AIR) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = chunkData.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== chunkData.CUBE_TYPE_AIR
							if(neighborsTypes[i] !== chunkData.CUBE_TYPE_AIR) {
								faceIsVisibleArray[i] = false;
							} else {
								faceIsVisibleArray[i] = true;
								numberOfVisibleFaces++;
							}
						}

						cube.setPosition([x - this.chunkSize.x / 2,
										  y - this.chunkSize.y / 2,
										  z - this.chunkSize.z / 2]);

						cube.setTexOffset([chunkData.cubeTypes[index], 0]);

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