class VoxelWalkabilityData {
	constructor(scene, voxelTypeData) {
		this._voxelTypeData = voxelTypeData;

		let voxelWalkabilitiesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD * 2);
		this._voxelWalkablilities = new Int16Array(voxelWalkabilitiesBuffer);
		this._initializeVoxelWalkabilities();

		let counter = 0;
		for(let i = 0; i < this._voxelWalkablilities.length; i++) {
			if(this._voxelWalkablilities[i] !== 0) {
				counter++;
			}
		}
		console.log(counter);


		this._visualizeWalkability = true;
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

		// Algorithm:
		// Iterate through voxels, if walkable (=== 1):
		//	-> Set voxel walkability to clusterIndex
		//	-> Get indices of all reachable walkable neighbors and set their walkability to clusterIndex
		//	-> Get all reachable walkable neighbors of the neighbors and set their walkability to clusterIndex
		//	-> ...
		//	-> Increase clusterIndex 

		let clusterIndex = 2;
		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					let index = this._getIndexFromCoords([x,y,z]);
					if(this._voxelWalkablilities[index] === 1) {
						this._voxelWalkablilities[index] = clusterIndex;

						// Find all walkable reachable neighbors and set their walkability to clusterIndex
						let reachableWalkableVoxelCoordsWithoutCluster = this._getReachableWalkableNeighborVoxelCoordsWithoutCluster([x,y,z]);
						let indicesCount = reachableWalkableVoxelCoordsWithoutCluster.length;

						let count = indicesCount;
						while(indicesCount > 0) {
							let temporaryIndices = [];
							for(let i = 0; i < indicesCount; i++) {
								index = this._getIndexFromCoords(reachableWalkableVoxelCoordsWithoutCluster[i]);
								this._voxelWalkablilities[index] = clusterIndex;
								temporaryIndices.push(this._getReachableWalkableNeighborVoxelCoordsWithoutCluster(reachableWalkableVoxelCoordsWithoutCluster[i]));
							}

							reachableWalkableVoxelCoordsWithoutCluster = [];

							for(let i = 0; i < temporaryIndices.length; i++) {
								for(let j = 0; j < temporaryIndices[i].length; j++) {
									reachableWalkableVoxelCoordsWithoutCluster.push(temporaryIndices[i][j]);
								}
							}

							indicesCount = reachableWalkableVoxelCoordsWithoutCluster.length;
							count += indicesCount;
						}
						clusterIndex++;
						if(count > 10)
							console.log("clusterCount: " + count);
					}
				}
			}
		}
		console.log(clusterIndex);
	}

	_getReachableWalkableNeighborVoxelCoordsWithoutCluster(coords) {
		let reachableWalkableNeighborVoxelCoordsWithoutCluster = [];

		let neighborCoords = [
			[coords[0] + 1, coords[1], coords[2]],
			[coords[0], coords[1], coords[2] + 1],
			[coords[0] - 1, coords[1], coords[2]],
			[coords[0], coords[1], coords[2] - 1]
		];

		// Check boundaries for x and z -> remove coords from neighborCoords if necessary
		if(coords[0] === 0) {
			neighborCoords.splice(2,1);
		} else if(coords[0] === WORLD_SIZE.x - 1) {
			neighborCoords.splice(0,1);
		}

		if(coords[2] === 0) {
			neighborCoords.splice(3,1);
		} else if(coords[2] === WORLD_SIZE.z - 1) {
			neighborCoords.splice(1,1);			
		}

		// Check boundaries for y -> restrict yLoop if necessary
		let yMin = -1;
		let yMax = 1;
		if(coords[1] === 0) {
			yMin = 0;
		} else if(coords[1] === WORLD_SIZE.y - 1) {
			yMax = 0;
		}

		neighborCoordsLoop: for(let i = 0; i < neighborCoords.length; i++) {
			yLoop: for(let y = yMax; y >= yMin; y--) {
				let currentCoords = [neighborCoords[i][0], neighborCoords[i][1] + y, neighborCoords[i][2]];

				// Check if there is air over coords if walking up or 
				// over neighbor.coords if walking down, otherwise entity would collide
				if(y === 1) {
					if(this._voxelTypeData.getVoxelType([ coords[0],
														  coords[1] + 2,
														  coords[2]]) !== VOXEL_TYPE.AIR) {
						continue yLoop;
					}
				} else if(y === -1) {
					if(this._voxelTypeData.getVoxelType([ currentCoords[0],
														  currentCoords[1] + 2,
														  currentCoords[2]]) !== VOXEL_TYPE.AIR) {
						break yLoop;
					}
				}

				let index = this._getIndexFromCoords(currentCoords);
				if(this._voxelWalkablilities[index] === 1) {
					this._voxelWalkablilities[index] = 0;
					reachableWalkableNeighborVoxelCoordsWithoutCluster.push(currentCoords);
					break yLoop;
				}
			}
		}
		return reachableWalkableNeighborVoxelCoordsWithoutCluster;
	}

	_addWalkabilityToScene() {
		let walkabilityGeometry = new THREE.Geometry();

		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					if(this.getVoxelWalkability([x,y,z]) !== 0) {
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