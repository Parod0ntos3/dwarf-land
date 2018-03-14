class VoxelWalkabilityData {
	constructor(scene, voxelTypeData) {
		this._voxelTypeData = voxelTypeData;

		let voxelWalkabilitiesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD);
		this._voxelWalkablilities = new Uint8Array(voxelWalkabilitiesBuffer);
		this._initializeVoxelWalkabilities();

		let counter = 0;
		for(let i = 0; i < this._voxelWalkablilities.length; i++) {
			if(this._voxelWalkablilities[i] !== 0) {
				counter++;
			}
		}

		this._visualizeWalkability = false;
		if(this._visualizeWalkability === true) {
			this._scene = scene;
			this.walkabilityPoints = {};
			this._addWalkabilityToScene();
		}

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
		// Voxel is walkable if:
		//	- Voxel is solid
		//	- Voxel at position y+1 and y+2 are air or outside the world

		let voxelIndex = this._getIndexFromCoords(coords);
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let voxelIsSolid = 	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.AIR &&
						  	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.WATER;

		if(voxelIsSolid === false) {
			this._voxelWalkablilities[voxelIndex] = 0;
			return;
		}

		if(y < WORLD_SIZE.y - 2) {
			if(	this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR &&
				this._voxelTypeData.getVoxelType([x, y + 2, z]) === VOXEL_TYPE.AIR) {
				this._voxelWalkablilities[voxelIndex] = 1;
			} else {
				this._voxelWalkablilities[voxelIndex] = 0;
			}
		} else if(y === WORLD_SIZE.y - 2) {
			if(	this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR) {
				this._voxelWalkablilities[voxelIndex] = 1;
			} else {
				this._voxelWalkablilities[voxelIndex] = 0;
			}
		} else if(y === WORLD_SIZE.y - 1) {
			this._voxelWalkablilities[voxelIndex] = 1;
		}
	}

	updateVoxelWalkablilityVisualisation() {
		if(this._visualizeWalkability === true) {
			this._scene.remove(this.walkabilityPoints);
			this._addWalkabilityToScene();
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

	_addWalkabilityToScene() {
		let walkabilityGeometry = new THREE.Geometry();

		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					if(this.getVoxelWalkability([x,y,z]) === 1) {
						let point = new THREE.Vector3();
						point.x = x;
						point.y = y + 0.5;
						point.z = z;

						walkabilityGeometry.vertices.push( point );
					}
				}
			}
		}

		let walkabilityMaterial = new THREE.PointsMaterial( { color: "rgb(255, 0, 0)", size : 0.25 } );
		this.walkabilityPoints = new THREE.Points( walkabilityGeometry, walkabilityMaterial );

		this._scene.add( this.walkabilityPoints );
	}

}