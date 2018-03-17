class VoxelWalkabilityData {
	constructor(scene, voxelTypeData) {
		this._voxelTypeData = voxelTypeData;

		this.VOXEL_NOT_WALKABLE = 0;
		this.VOXEL_INITIAL_WALKABLE = 1;
		this.INITIAL_VOXEL_CLUSTER_INDEX = 2;

		this._clusterSizes = [];
		this._availableClusterIndices = [];
		this._highestClusterIndex = this.INITIAL_VOXEL_CLUSTER_INDEX;

		let voxelWalkabilitiesBuffer = new ArrayBuffer(NUMBER_OF_VOXELS_IN_WORLD * 2);
		this._voxelWalkablilities = new Int16Array(voxelWalkabilitiesBuffer);
		this._initializeVoxelWalkabilities();

		let counter = 0;
		for(let i = 0; i < this._voxelWalkablilities.length; i++) {
			if(this._voxelWalkablilities[i] !== this.VOXEL_NOT_WALKABLE) {
				counter++;
			}
		}
		console.log("numberOfWalkableVoxels: " + counter);
		console.log("clusterSizes: " + this._clusterSizes);


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
		// Function is used in pathfinder to temporarly set walkability to - walkability.
		this._voxelWalkablilities[this._getIndexFromCoords(coords)] = walkability;
	}

	updateVoxelWalkability(coords) {
		let coordsList = [];
		for(let y = -2; y <= 0; y++) {
			coordsList.push([coords[0], coords[1] + y, coords[2]]);
		}

		let startCoordsForSplitting = [];

		iLoop: for(let i = 0; i < coordsList.length; i++) {
			let index = this._getIndexFromCoords(coordsList[i]);
			let oldWalkability = this._voxelWalkablilities[index];

			this._setInitialVoxelWalkabilityValue(coordsList[i]);

			if(oldWalkability !== VOXEL_NOT_WALKABLE && this._voxelWalkablilities[index] !== VOXEL_NOT_WALKABLE) {
				// CASE 1: set walkability to old cluster value
				this._voxelWalkablilities = oldWalkability;
			} else if(oldWalkability === VOXEL_NOT_WALKABLE && this._voxelWalkablilities[index] === VOXEL_NOT_WALKABLE) {
				// CASE 2: nothing happens
			} else if(oldWalkability === VOXEL_NOT_WALKABLE && this._voxelWalkablilities[index] !== VOXEL_NOT_WALKABLE) {
				// CASE 3: set walkability and check if clusters need to be merged dependend from neighbor walkabilities
				let reachableNeighborsWalkabilities = this._getReachableWalkableNeighborWalkabilities(coordsList[i]);

				if(reachableNeighborsWalkabilities.length === 0) {
					this._voxelWalkablilities[index] = this._getIndexForNewCluster();
					continue iLoop;
				}

				let defaultWalkability = reachableNeighborsWalkabilities[0];
				let clustersNeedToBeMerged = false;
				for(let j = 1; j < reachableNeighborsWalkabilities.length; j++) {
					if(reachableNeighborsWalkabilities[j] !== defaultWalkability) {
						clustersNeedToBeMerged = true;
					}
				}

				if(clustersNeedToBeMerged === false) {
					this._voxelWalkablilities[index] = defaultWalkability;
				} else {
					this._mergeClusters(coordsList[i]);
				}
			} else {
				// CASE 4:
				let reachableWalkableNeighborCoords = this._getReachableWalkableNeighborCoordsWithClusterIndex(coordsList[i]);

				if(reachableNeighborsWalkabilities.length < 2) {
					continue iLoop;
				}

				for(let j = 0; j < reachableWalkableNeighborCoords.length; i++) {
					for(let k = 0; k < reachableWalkableNeighborCoords.length; k++) {
						if(j !== k) {
							let path = this._getPath(reachableWalkableNeighborCoords[j], reachableWalkableNeighborCoords[k]);
							if(path === undefined) {
								startCoordsForSplitting.push(reachableWalkableNeighborCoords[j]);
							}
						}
					}					
				}
			}
		}

		for(let i = 0; i < startCoordsForSplitting.length; i++) {
			for(let j = 0; j < startCoordsForSplitting.length; j++) {
				if(areCoordsEqual(startCoordsForSplitting[i], startCoordsForSplitting[j])) {
					// REMOVE FROM LIST!!
				}
			}
		}
		// Cases:
		//	- CASE 1: voxel was walkable and is now walkable
		//		-> set value to old cluster value, but nothing more happens
		//	- CASE 2: voxel was not walkable and is not walkable:
		//		-> nothing happens
		//	- CASE 3: voxel was not walkable and is now walkable:
		//		-> find reachable walkable neighbors
		//			+ number of walkable neighbors === 0 -> new cluster
		//			+ number of walkable neighbors > 1:
		//				# all neighbors have same walkability -> set walkability to neighbors walkability
		//				# different walkabilities: -> merge clusters
		//	- CASE 4: voxel was walkable and is now not walkable:
		//		-> find reachable walkable neighbors
		//			+ number of walkable neighbors < 2 -> nothing happens
		//			+ number of walkable neighbors > 1:
		//				# all neighbors with same walkability have to proof, that there is a way from one neighbors to the other one
		//					-> find a path from every neighbor with same walkability to other neighbor
		//						... path is available
		//							-> nothing happens
		//						... path is not available
		//							-> split clusters with start point neighbor coords
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
					this._setInitialVoxelWalkabilityValue([x, y, z]);
				}
			}
		}

		this._createInitialWalkabilityClusters();
	}

	_setInitialVoxelWalkabilityValue(coords) {
		// Voxel walkability === VOXEL_INITIAL_WALKABLE if (walkable):
		//	- Voxel is solid
		//	- Voxel at position y+1 and y+2 are air or outside the world
		// Otherwise walkability === VOXEL_NOT_WALKABLE

		let voxelIndex = this._getIndexFromCoords(coords);
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let voxelIsSolid = 	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.AIR &&
						  	this._voxelTypeData.getVoxelType([x, y, z]) !== VOXEL_TYPE.WATER;

		if(voxelIsSolid === false) {
			this._voxelWalkablilities[voxelIndex] = this.VOXEL_NOT_WALKABLE;
			return;
		}

		if(y < WORLD_SIZE.y - 2) {
			if(	this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR &&
				this._voxelTypeData.getVoxelType([x, y + 2, z]) === VOXEL_TYPE.AIR) {
				this._voxelWalkablilities[voxelIndex] = this.VOXEL_INITIAL_WALKABLE;
			} else {
				this._voxelWalkablilities[voxelIndex] = this.VOXEL_NOT_WALKABLE;
			}
		} else if(y === WORLD_SIZE.y - 2) {
			if(	this._voxelTypeData.getVoxelType([x, y + 1, z]) === VOXEL_TYPE.AIR) {
				this._voxelWalkablilities[voxelIndex] = this.VOXEL_INITIAL_WALKABLE;
			} else {
				this._voxelWalkablilities[voxelIndex] = this.VOXEL_NOT_WALKABLE;
			}
		} else if(y === WORLD_SIZE.y - 1) {
			this._voxelWalkablilities[voxelIndex] = this.VOXEL_INITIAL_WALKABLE;
		}
	}

	_createInitialWalkabilityClusters() {
		// Algorithm:
		// Iterate through voxels, if walkable (=== INITIAL_VOXEL_CLUSTER_INDEX):
		//	-> Set voxel walkability to clusterIndex
		//	-> Get indices of all reachable walkable neighbors and set their walkability to clusterIndex
		//	-> Get all reachable walkable neighbors of the neighbors and set their walkability to clusterIndex
		//	-> ...
		//	-> Increase clusterIndex 

		let clusterIndex = this._getIndexForNewCluster();
		console.log("Index: " + clusterIndex);
		for(let x = 0; x < WORLD_SIZE.x; x++) {
			for(let z = 0; z < WORLD_SIZE.z; z++) {
				for(let y = 0; y < WORLD_SIZE.y; y++) {
					let index = this._getIndexFromCoords([x,y,z]);
					if(this._voxelWalkablilities[index] === this.VOXEL_INITIAL_WALKABLE) {
						this._voxelWalkablilities[index] = clusterIndex;

						// Find all walkable reachable neighbors and set their walkability to clusterIndex
						let reachableWalkableVoxelCoordsWithoutCluster = this._getReachableWalkableNeighborCoordsWithClusterIndex([x,y,z], this.VOXEL_INITIAL_WALKABLE);
						let indicesCount = reachableWalkableVoxelCoordsWithoutCluster.length;
						for( let i = 0; i < indicesCount; i++) {
							this.setVoxelWalkability(reachableWalkableVoxelCoordsWithoutCluster[i], clusterIndex);
						}

						let numberOfVoxelsInCluster = 1 + indicesCount;
						while(indicesCount > 0) {
							let temporaryIndices = [];
							for(let i = 0; i < indicesCount; i++) {
								let reachableWalkableNeighborsWithoutCluster = this._getReachableWalkableNeighborCoordsWithClusterIndex(reachableWalkableVoxelCoordsWithoutCluster[i], this.VOXEL_INITIAL_WALKABLE);
								for( let i = 0; i < reachableWalkableNeighborsWithoutCluster.length; i++) {
									this.setVoxelWalkability(reachableWalkableNeighborsWithoutCluster[i], clusterIndex);
								}
								temporaryIndices.push(reachableWalkableNeighborsWithoutCluster);
							}

							reachableWalkableVoxelCoordsWithoutCluster = [];

							for(let i = 0; i < temporaryIndices.length; i++) {
								for(let j = 0; j < temporaryIndices[i].length; j++) {
									reachableWalkableVoxelCoordsWithoutCluster.push(temporaryIndices[i][j]);
								}
							}

							indicesCount = reachableWalkableVoxelCoordsWithoutCluster.length;
							numberOfVoxelsInCluster += indicesCount;
						}
						this._addCluster(clusterIndex, numberOfVoxelsInCluster);
						clusterIndex = this._getIndexForNewCluster();
					}
				}
			}
		}
		console.log("numberOfClusters: " + clusterIndex);
	}

	/*	Functiion returns the reachable walkable neighbors of a voxel:
		-> If clusterIndex is set, it only returns the neighbors with the specific clusterIndex
		-> If clusterIndex is not set, it returns all walkable neighbors
	*/
	_getReachableWalkableNeighborCoordsWithClusterIndex(coords, clusterIndex) {
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

				if(clusterIndex === undefined) {
					if(this._voxelWalkablilities[index] > this.VOXEL_NOT_WALKABLE) {
						reachableWalkableNeighborVoxelCoordsWithoutCluster.push(currentCoords);
						break yLoop;
					}
				} else {
					if(this._voxelWalkablilities[index] === clusterIndex) {
						reachableWalkableNeighborVoxelCoordsWithoutCluster.push(currentCoords);
						break yLoop;
					}
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
					if(this.getVoxelWalkability([x,y,z]) !== this.VOXEL_NOT_WALKABLE) {
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

	// Functions for managing the walkability-clusters:

	_getIndexForNewCluster() {
		if(this._availableClusterIndices.length === 0) {
			this._highestClusterIndex++;
			// Check if number of clusters is lower than Int16Array restriction:
			if(this._highestClusterIndex > 32767) {
				console.log("Reached maximum amount of clusters (restricted by Int16Array)");
			}
			return (this._highestClusterIndex - 1);
		} else {
			let availableClusterIndex = this._availableClusterIndices[0];
			this._availableClusterIndices.splice(0, 1);
			return availableClusterIndex;
		}
	}

	_removeCluster(clusterIndex) {
		this._availableClusterIndices.push(clusterIndex);
		this._clusterSizes[clusterIndex] = 0;
	}

	_addCluster(clusterIndex, numberOfVoxels) {
		while(clusterIndex + 1 > this._clusterSizes.length) {
			this._clusterSizes.push(0);
		}
		this._clusterSizes[clusterIndex] = numberOfVoxels;
	}

}