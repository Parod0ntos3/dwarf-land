class Layer {
	constructor(layerIndex, worldData) {
		this.layerIndex = layerIndex;

		this.CUBE_SIDE_LENGTH = 1;

		this.layerSize = {x: worldData.size.x, y: 1, z: worldData.size.z};
		this.numberOfCubesPerLayer = this.layerSize.x * this.layerSize.y * this.layerSize.z;

		let verticesBuffer = new ArrayBuffer(4 * 18 * 6 * this.numberOfCubesPerLayer);
		let normalsBuffer = new ArrayBuffer(4 * 18 * 6 * this.numberOfCubesPerLayer);
		let texCoordsBuffer = new ArrayBuffer(4 * 12 * 6 * this.numberOfCubesPerLayer);
		let indexBuffer = new ArrayBuffer(4 * 12 * 3 * this.numberOfCubesPerLayer);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.verticesCount = 0;

		this.inizializeVertexBufferObjects(worldData);
	}

	inizializeVertexBufferObjects(worldData) {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let triangleIndex = 0;
		for(let x = 0; x < this.layerSize.x; x++) {
			for(let y = this.layerIndex; y < this.layerIndex + this.layerSize.y; y++) {
				for(let z = 0; z < this.layerSize.z; z++) {
					let index = worldData.getIndexFromCoordinates([x,y,z]);

					// If cubeType !== worldData.CUBE_TYPE_AIR, check if cube is visible
					if(worldData.cubeTypes[index] !== worldData.CUBE_TYPE_AIR) {

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

						cube.setPosition([x - this.layerSize.x / 2,
										  y - this.layerSize.y / 2,
										  z - this.layerSize.z / 2]);
						cube.setTexOffset([worldData.cubeTypes[index], 0]);

						cube.setFaceVisibility(faceIsVisibleArray);

						this.verticesArray.set(cube.getGeometry(), arrayIndex * 18);
						this.normalsArray.set(cube.getNormals(), arrayIndex * 18);
						this.texCoordsArray.set(cube.getTexCoords(), arrayIndex * 12);

						let indices = [];
						for(let i = 0; i < numberOfVisibleFaces * 2; i++) {
							for(let j = 0; j < 3; j++) {
								indices.push(triangleIndex);
								triangleIndex++;
							}
						}
						this.indexArray.set(new Float32Array(indices), arrayIndex * 6);

						arrayIndex += numberOfVisibleFaces;
					}
				}
			}
		}
		this.verticesCount = arrayIndex * 6;
	}
}