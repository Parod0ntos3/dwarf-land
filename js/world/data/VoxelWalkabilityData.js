class VoxelWalkabilityData {
	constructor(voxelTypeData) {
		this.voxelTypeData = voxelTypeData;

		let voxelWalkabilitiesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD);
		this.voxelWalkabilities = new Uint8Array(voxelWalkabilitiesBuffer);
		this.initializeVoxelWalkabilities();
	}

	initializeVoxelWalkabilities() {
		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					this.updateVoxelWalkability([x, y, z]);
				}
			}
		}
	}

	getVoxelWalkability(coords) {
		return this.voxelWalkabilities[this.getIndexFromCoordinates(coords)];
	}

	setVoxelWalkability(coords, walkability) {
		// Function is used in pathfinder to temporarly set walkability to 0.
		this.voxelWalkabilities[this.getIndexFromCoordinates(coords)] = walkability;
	}

	updateVoxelWalkability(coords) {
		let voxelIndex = this.getIndexFromCoordinates(coords);
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if(y === 0 || this.voxelTypeData.getVoxelTypeByIndex(voxelIndex) === VOXEL_TYPE.WATER) {
			this.voxelWalkabilities[voxelIndex] = 0;
			return;
		}

		let voxelIsSolid = 	this.voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.AIR &&
						  	this.voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.WATER;

		if(voxelIsSolid === true) {
			this.voxelWalkabilities[voxelIndex] = 0;
			return;
		}

		let lowerVoxelIsSolid = this.voxelTypeData.getVoxelType([x, y - 1, z]) !== VOXEL_TYPE.AIR &&
								this.voxelTypeData.getVoxelType([x, y - 1, z]) !== VOXEL_TYPE.WATER;

		if(lowerVoxelIsSolid === true && y === WORLD_SIZE.y - 1) {
			this.voxelWalkabilities[voxelIndex] = 1;		
		} else if(lowerVoxelIsSolid === true) {
			let upperVoxelIsNotSolid = 	this.voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR ||
										this.voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.WATER;
			if(upperVoxelIsNotSolid === true) {
				this.voxelWalkabilities[voxelIndex] = 1;					
			} else {
				this.voxelWalkabilities[voxelIndex] = 0;			
			}
		} else {
			this.voxelWalkabilities[voxelIndex] = 0;			
		}
	}

	getIndexFromCoordinates(coords) {
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let index = x * (WORLD_SIZE.z * WORLD_SIZE.y) + z * WORLD_SIZE.y + y;
		return index;
	}
}