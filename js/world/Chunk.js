class Chunk {
	constructor(position) {
		this.position = position;

		this.CUBE_TYPE_AIR = 255;
		this.CUBE_SIDE_LENGTH = 1;

		this.size = {x: 25, y: 3, z: 25};
		this.numberOfCubes = this.size.x * this.size.y * this.size.z;

		let cubeTypeBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeTypes = new Uint8Array(cubeTypeBuffer);
		this.initializeCubeTypes();

		let verticesBuffer = new ArrayBuffer(4 * 18 * 6 * this.numberOfCubes);
		let normalsBuffer = new ArrayBuffer(4 * 18 * 6 * this.numberOfCubes);
		let texCoordsBuffer = new ArrayBuffer(4 * 12 * 6 * this.numberOfCubes);
		let indexBuffer = new ArrayBuffer(4 * 12 * 3 * this.numberOfCubes);

		this.verticesArray = new Float32Array(verticesBuffer);
		this.normalsArray = new Float32Array(normalsBuffer);
		this.texCoordsArray = new Float32Array(texCoordsBuffer);
		this.indexArray = new Uint32Array(indexBuffer);

		this.verticesCount = 0;

		this.inizializeVertexBufferObjects();
	}

	initializeCubeTypes() {
		let cubeIndex = 0;
		for(let x = 0; x < this.size.x; x++) {
			for(let y = 0; y < this.size.y; y++) {
				for(let z = 0; z < this.size.z; z++) {
					this.cubeTypes[cubeIndex] = Math.floor(Math.random() * 5) - 1;
					cubeIndex++;					
				}
			}
		}
	}

	inizializeVertexBufferObjects() {
		let cube = new Cube(this.CUBE_SIDE_LENGTH);
		let arrayIndex = 0;
		let triangleIndex = 0;
		for(let x = 0; x < this.size.x; x++) {
			for(let y = 0; y < this.size.y; y++) {
				for(let z = 0; z < this.size.z; z++) {
					let index = this.getIndexFromCoordinates([x,y,z]);

					// If cubeType !== this.CUBE_TYPE_AIR, check if cube is visible
					if(this.cubeTypes[index] !== this.CUBE_TYPE_AIR) {

						// Get the types of the 6 neighbor-cubes
						let neighborsTypes = this.getNeighborsTypes([x, y, z]);
 
						// Go through array neighborsTypes and check, if individual neighbor cube is solid
						let faceIsVisibleArray = new Array(6);
						let numberOfVisibleFaces = 0;
						for(let i = 0; i < 6; i++) {
							// Check if cubeType of neighbor !== this.CUBE_TYPE_AIR
							if(neighborsTypes[i] !== this.CUBE_TYPE_AIR) {
								faceIsVisibleArray[i] = false;
							} else {
								faceIsVisibleArray[i] = true;
								numberOfVisibleFaces++;
							}
						}

						cube.setPosition([x + this.position[0] / 2 - this.size.x / 2,
										  y + this.position[0] / 2 - this.size.y / 2,
										  z + this.position[0] / 2 - this.size.z / 2]);
						cube.setTexOffset([this.cubeTypes[index], 0]);

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

	getNeighborsTypes(coords) {
		let neighborsTypes = [];
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if( x >= 0 && x <= this.size.x && 
			y >= 0 && y <= this.size.y &&
			z >= 0 && z <= this.size.z) {

			if(x - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x - 1, y, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z + 1 < this.size.z)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y, z + 1])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(x + 1 < this.size.x)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x + 1, y, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y, z - 1])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);
 
			if(y + 1 < this.size.y)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y + 1, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y - 1, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

		}

		return neighborsTypes;
	}

	getIndexFromCoordinates(coords) {
		return coords[0] * (this.size.y * this.size.z) + coords[1] * this.size.z + coords[2];

	}
}