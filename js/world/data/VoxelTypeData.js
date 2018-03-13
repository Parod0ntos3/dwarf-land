class VoxelTypeData {
	constructor() {
		this._simplex = new SimplexNoise();

		let voxelTypesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD);
		this._voxelTypes = new Uint8Array(voxelTypesBuffer);
		this._initializeVoxelTypes();	
	}

	// Public methods:

	getVoxelType(coords) {
		return this._voxelTypes[this._getIndexFromCoordinates(coords)];
	}

	getVoxelTypeByIndex(index) {
		return this._voxelTypes[index];
	}

	setVoxelType(coords, type) {
		this._voxelTypes[this._getIndexFromCoordinates(coords)] = type;
	}


	getHeight(x, z) {
		for(let y = 0; y < CHUNK_SIZE.y; y++) {
			if(this.getVoxelType([x,y,z]) === VOXEL_TYPE.AIR) {
				return y;
			}
		}
	}

	getNeighborsTypes(coords) {
		let neighborsTypes = [];
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if( x >= 0 && x < WORLD_SIZE.x && 
			y >= 1 && y < WORLD_SIZE.y &&	// Layer y = 0 should not be rendered -> Plane instead of voxels!
			z >= 0 && z < WORLD_SIZE.z) {

			if(x - 1 >= 0)
				neighborsTypes.push(this.getVoxelType([x - 1, y, z]));
			else
				neighborsTypes.push(VOXEL_TYPE.OUTSIDE_WORLD);

			if(z + 1 < WORLD_SIZE.z)
				neighborsTypes.push(this.getVoxelType([x, y, z + 1]));
			else
				neighborsTypes.push(VOXEL_TYPE.OUTSIDE_WORLD);

			if(x + 1 < WORLD_SIZE.x)
				neighborsTypes.push(this.getVoxelType([x + 1, y, z]));
			else
				neighborsTypes.push(VOXEL_TYPE.OUTSIDE_WORLD);

			if(z - 1 >= 0)
				neighborsTypes.push(this.getVoxelType([x, y, z - 1]));
			else
				neighborsTypes.push(VOXEL_TYPE.OUTSIDE_WORLD);
 
			if(y + 1 < WORLD_SIZE.y)
				neighborsTypes.push(this.getVoxelType([x, y + 1, z]));
			else
				neighborsTypes.push(VOXEL_TYPE.AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.getVoxelType([x, y - 1, z]));
			else
				neighborsTypes.push(VOXEL_TYPE.OUTSIDE_WORLD);
			
		}

		return neighborsTypes;
	}

	// Private methods:

	_initializeVoxelTypes() {
		let voxelIndex = 0;
		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				let height = this._getHeightFromSimplex(x, z);
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					if(y <= height - 2) {
						this._voxelTypes[voxelIndex] = 0;
					} else if(y <= height && y <= this._getSandHeightFromSimplex(x, z)) {
						this._voxelTypes[voxelIndex] = 2;
					} else if(y <= height && y > WATER_SURFACE_HEIGHT) {
						this._voxelTypes[voxelIndex] = 1;
					} else if(y > height && y <= WATER_SURFACE_HEIGHT) {
						this._voxelTypes[voxelIndex] = VOXEL_TYPE.WATER;						
					} else {
						this._voxelTypes[voxelIndex] = VOXEL_TYPE.AIR;
					}
					voxelIndex++;
				}
			}
		}
	}

	_getHeightFromSimplex(x, z) {
		let x_dist = x - (CHUNK_SIZE.x * NUMBER_OF_CHUNKS.x) / 2;
		let z_dist = z - (CHUNK_SIZE.z * NUMBER_OF_CHUNKS.z) / 2;

		let distanceFromCenter = Math.sqrt(x_dist * x_dist + z_dist * z_dist);
		if(distanceFromCenter === 0)
			distanceFromCenter = 1;

		// Height in interval [0; 48]
		let heightFromDistanceFromCenter = -16;
		
		if (distanceFromCenter <= 128)
			heightFromDistanceFromCenter = (143021 * Math.pow(distanceFromCenter, 3))/2246553600
			 - (8545943 * Math.pow(distanceFromCenter, 2))/748851200
			 - (5229361 * distanceFromCenter)/70204800
			 + 48;

		let noise = 0;
		for(let i = 4; i <= 8; i++) {
			let waveLength = i * 8;
			noise += this._simplex.noise(x / waveLength, z / waveLength);
		}
		// Scale noise from [-1; 1]*4 to [0; 20]*4
		noise += 1;
		noise *= 10;

		// Add noise to heightFromDistanceFromCenter
		let height = heightFromDistanceFromCenter + noise;

		if(height < 0)
			height = 0;

		return height;
	}

	_getSandHeightFromSimplex(x, z) {
		let noise = 0;
		for(let i = 5; i <= 8; i++) {
			let waveLength = i * 6;
			noise += this._simplex.noise(x / waveLength, z / waveLength);
		}
		// Scale noise
		noise += 1;
		noise *= 3;
		noise += WATER_SURFACE_HEIGHT;

		return noise;
	}

	_getIndexFromCoordinates(coords) {
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let index = x * (WORLD_SIZE.z * WORLD_SIZE.y) + z * WORLD_SIZE.y + y;
		return index;
	}
}