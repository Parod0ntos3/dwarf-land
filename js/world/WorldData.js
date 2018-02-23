class WorldData {
	constructor() {
		this.CUBE_TYPE_AIR = 254;
		this.CUBE_TYPE_OUTSIDE_WORLD = 255;

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
				//let height = (this.simplex.noise(x / 64, z / 64) + 1) * 16 + 32;
				for(let y = 0; y < this.chunkSize.y; y++) {
					let noise = this.getNoiseValue(x,y,z);
					//if(y <= height)
					if(noise > 0.75 * (1/ 184))
						this.cubeTypes[cubeIndex] = Math.floor(Math.random() * 5);
					else
						this.cubeTypes[cubeIndex] = this.CUBE_TYPE_AIR;
					cubeIndex++;
				}
			}
		}
	}

	getNoiseValue(x, y, z) {
		let x_dist = x - (this.chunkSize.x * this.numberOfChunks.x) / 2;
		let y_dist = y - (this.chunkSize.y * 1) / 2;
		let z_dist = z - (this.chunkSize.z * this.numberOfChunks.z) / 2;

		if(x_dist === 0)
			x_dist = 1;
		if(y_dist === 0)
			y_dist = 1;
		if(z_dist === 0)
			z_dist = 1;

		let distanceFromCenter = Math.sqrt(x_dist * x_dist + y_dist * y_dist + z_dist * z_dist);
		//console.log(x + " " + y + " " + z + " " + distanceFromCenter);

		let noise = 0;

		for(let i = 5; i <= 8; i++) {
			let waveLength = i * 8;
			noise += this.simplex.noise3d(x / waveLength, y / waveLength, z / waveLength);
		}

		noise *= (1 / distanceFromCenter);
		return noise;
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