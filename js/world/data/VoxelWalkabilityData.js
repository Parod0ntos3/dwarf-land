class VoxelWalkabilityData {
	constructor(voxelTypeData) {
		this._voxelTypeData = voxelTypeData;

		let voxelWalkabilitiesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD);
		this._voxelWalkablilities = new Uint8Array(voxelWalkabilitiesBuffer);
		this._initializeVoxelWalkabilities();
	}

	// Public methods:

	getVoxelWalkability(coords) {
		return this._voxelWalkablilities[this._getIndexFromCoords(coords)];
	}

	setVoxelWalkability(coords, walkability) {
		// Function is used in pathfinder to temporarly set walkability to 0.
		this._voxelWalkablilities[this._getIndexFromCoords(coords)] = walkability;
	}

	updateVoxelWalkability(coords) {
		let voxelIndex = this._getIndexFromCoords(coords);
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if(y === 0 || this._voxelTypeData.getVoxelTypeByIndex(voxelIndex) === VOXEL_TYPE.WATER) {
			this._voxelWalkablilities[voxelIndex] = 0;
			return;
		}

		let voxelIsSolid = 	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.AIR &&
						  	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.WATER;

		if(voxelIsSolid === true) {
			this._voxelWalkablilities[voxelIndex] = 0;
			return;
		}

		let lowerVoxelIsSolid = this._voxelTypeData.getVoxelType([x, y - 1, z]) !== VOXEL_TYPE.AIR &&
								this._voxelTypeData.getVoxelType([x, y - 1, z]) !== VOXEL_TYPE.WATER;

		if(lowerVoxelIsSolid === true && y === WORLD_SIZE.y - 1) {
			this._voxelWalkablilities[voxelIndex] = 1;		
		} else if(lowerVoxelIsSolid === true) {
			let upperVoxelIsNotSolid = 	this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR ||
										this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.WATER;
			if(upperVoxelIsNotSolid === true) {
				this._voxelWalkablilities[voxelIndex] = 1;					
			} else {
				this._voxelWalkablilities[voxelIndex] = 0;			
			}
		} else {
			this._voxelWalkablilities[voxelIndex] = 0;			
		}
	}

	// Private methods:

	_getIndexFromCoords(coords) {
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let index = x * (WORLD_SIZE.z * WORLD_SIZE.y) + z * WORLD_SIZE.y + y;
		return index;
	}

	_initializeVoxelWalkabilities() {
		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					this.updateVoxelWalkability([x, y, z]);
				}
			}
		}
	}
}