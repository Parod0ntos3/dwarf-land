class WorldData {
	constructor() {
		this.CUBE_TYPE_AIR = 255;

		this.chunkSize = {x: 16, y: 64, z: 16};
		this.numberOfChunks = {x: 4, z: 4};
		this.worldSize = {x: this.chunkSize.x * this.numberOfChunks.x,
						  y: this.chunkSize.y,
						  z: this.chunkSize.z * this.numberOfChunks.z};
		this.cubeTypes = [];

		this.numberOfCubesPerChunk = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;
		this.numberOfCubes = this.numberOfCubesPerChunk * this.numberOfChunks.x * this.numberOfChunks.z;

		let cubeTypeBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeTypes = new Uint8Array(cubeTypeBuffer);
		this.initializeCubeTypes();
	}

	initializeCubeTypes() {
		let cubeIndex = 0;
		for(let x = 0; x < this.chunkSize.x * this.numberOfChunks.x; x++) {
			for(let z = 0; z < this.chunkSize.z * this.numberOfChunks.z; z++) {
				for(let y = 0; y < this.chunkSize.y; y++) {
					this.cubeTypes[cubeIndex] = Math.floor(Math.random() * 5);
					cubeIndex++;
				}
			}
		}
	}

	getCubeType(coords) {
		return this.cubeTypes[this.getIndexFromCoordinates(coords)];
	}

	getNeighborsTypes(coords) {
		let neighborsTypes = [];
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if( x >= 0 && x <= this.worldSize.x && 
			y >= 0 && y <= this.worldSize.y &&
			z >= 0 && z <= this.worldSize.z) {

			if(x - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x - 1, y, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z + 1 < this.worldSize.z)
				neighborsTypes.push(this.getCubeType([x, y, z + 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(x + 1 < this.worldSize.x)
				neighborsTypes.push(this.getCubeType([x + 1, y, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y, z - 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);
 
			if(y + 1 < this.worldSize.y)
				neighborsTypes.push(this.getCubeType([x, y + 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y - 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

		}

		return neighborsTypes;
	}	

	getIndexFromCoordinates(coords) {
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let index = x * (this.worldSize.z * this.worldSize.y) + z * this.worldSize.y + y;
		return index;
	}
}