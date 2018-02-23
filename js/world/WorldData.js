class WorldData {
	constructor() {
		this.CUBE_TYPE_AIR = 254;
		this.CUBE_TYPE_WATER = this.CUBE_TYPE_AIR;
		this.CUBE_TYPE_OUTSIDE_WORLD = 255;

		this.WATER_SURFACE_HEIGHT = 8;

		this.simplex = new SimplexNoise();


		this.chunkSize = {x: 16, y: 64, z: 16};
		this.numberOfChunks = {x: 16, z: 16};
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
				let height = this.getHeightFromSimplex(x, z);
				for(let y = 0; y < this.chunkSize.y; y++) {
					if(y <= height - 2) {
						this.cubeTypes[cubeIndex] = 0;
					} else if(y <= height && y <= this.WATER_SURFACE_HEIGHT) {
						this.cubeTypes[cubeIndex] = 2;
					} else if(y <= height && y > this.WATER_SURFACE_HEIGHT) {
						this.cubeTypes[cubeIndex] = 1;
					} else if(y > height && y <= this.WATER_SURFACE_HEIGHT) {
						this.cubeTypes[cubeIndex] = this.CUBE_TYPE_WATER;						
					} else {
						this.cubeTypes[cubeIndex] = this.CUBE_TYPE_AIR;
					}
					cubeIndex++;
				}
			}
		}
	}

	getHeightFromSimplex(x, z) {
		let maxDistance = (this.chunkSize.x * this.numberOfChunks.x * 0.5 * Math.sqrt(2));
		let normFactor = this.chunkSize.y / maxDistance * 0.75;
		let x_dist = x - (this.chunkSize.x * this.numberOfChunks.x) / 2;
		let z_dist = z - (this.chunkSize.z * this.numberOfChunks.z) / 2;

		let distanceFromCenter = Math.sqrt(x_dist * x_dist + z_dist * z_dist);
		if(distanceFromCenter === 0)
			distanceFromCenter = 1;
		distanceFromCenter *= 2;

		// Height in interval [0; ??]
		let heightFromDistanceFromCenter = (maxDistance - distanceFromCenter) * normFactor;

		let noise = 0;
		for(let i = 5; i <= 8; i++) {
			let waveLength = i * 8;
			noise += this.simplex.noise(x / waveLength, z / waveLength);
		}
		// Scale noise from [-1; 1] to [0; 18]
		noise += 1;
		noise *= 8;

		// Add noise to heightFromDistanceFromCenter
		let height = heightFromDistanceFromCenter + noise;

		return height;
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
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(z + 1 < this.worldSize.z)
				neighborsTypes.push(this.getCubeType([x, y, z + 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(x + 1 < this.worldSize.x)
				neighborsTypes.push(this.getCubeType([x + 1, y, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(z - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y, z - 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);
 
			if(y + 1 < this.worldSize.y)
				neighborsTypes.push(this.getCubeType([x, y + 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y - 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

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