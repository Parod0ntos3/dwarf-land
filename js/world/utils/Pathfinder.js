class Pathfinder {
	constructor(voxelTypesData, voxelWalkablilityData) {
		this._voxelTypesData = voxelTypesData;
		this._voxelWalkablilityData = voxelWalkablilityData;
	}

	// Public methods:

	getPath(startCoords, endCoords) {
		let closedSet = [];
		let openSet = [];

		let currentNode = { coords: startCoords,
							parentNode: null, 
							costs: this._getManhattenDistance(startCoords, endCoords) };
		openSet.push(currentNode);
		this._voxelWalkablilityData.setVoxelWalkability(startCoords, 0);

		let iterations = 0;
		while ( currentNode.coords[0] !== endCoords[0] || 
				currentNode.coords[1] !== endCoords[1] || 
				currentNode.coords[2] !== endCoords[2]) {
			// Iterate through neighbor nodes and put them into openSet if walkable.
			let neighborCoords = [
				[currentNode.coords[0] + 1, currentNode.coords[1], currentNode.coords[2]],
				[currentNode.coords[0], currentNode.coords[1], currentNode.coords[2] + 1],
				[currentNode.coords[0] - 1, currentNode.coords[1], currentNode.coords[2]],
				[currentNode.coords[0], currentNode.coords[1], currentNode.coords[2] - 1]
			];

			neighborCoordsLoop: for(let i = 0; i < neighborCoords.length; i++) {
				yLoop: for(let y = 1; y >= -1; y--) {
					let coords = [neighborCoords[i][0], neighborCoords[i][1] + y, neighborCoords[i][2]];
					
					// Check if there is air over currentNode.coords if walking up or 
					// over neighbor.coords if walking down, otherwise entity would collide
					if(y === 1) {
						if(this._voxelTypesData.getVoxelType([currentNode.coords[0],
												  currentNode.coords[1] + 2,
												  currentNode.coords[2]]) !== VOXEL_TYPE.AIR) {
							continue yLoop;
						}
					} else if(y === -1) {
						if(this._voxelTypesData.getVoxelType([coords[0],
												  coords[1] + 2,
												  coords[2]]) !== VOXEL_TYPE.AIR) {
							break yLoop;
						}
					}
					
					if(this._voxelWalkablilityData.getVoxelWalkability(coords) === 1) {
						// Calculate f = g + h, where g are the costs from the start to
						// the current field and h are the estimated costs to the target
						let fCosts = this._getManhattenDistance(startCoords, coords)
									 + this._getManhattenDistance(endCoords, coords);
						openSet.push({coords: coords, parentNode: currentNode, costs: fCosts});

						this._voxelWalkablilityData.setVoxelWalkability(coords, 0);

						break yLoop;
					}
				}
			}

			// Put current field into the closedSet
			closedSet.push(currentNode);

			// Choose field with the lowest costs from the openSet as currentNode for next iteration and remove it from openSet
			if(openSet.length > 0) {
				let lowestCosts = 100000;
				let lowestCostIndex = 0;
				for(let i = 0; i < openSet.length; i++) {
					if(lowestCosts > openSet[i].costs) {
						currentNode = openSet[i];
						lowestCosts = openSet[i].costs;
						lowestCostIndex = i;
					}
				}
				openSet.splice(lowestCostIndex,1);
			} else {
				// Stop if openSet.length === 0
				break;
			}

			if(iterations++ > 1000)
				break;
		}

		// Reset walkability in voxelWalkabliltyData
		this._voxelWalkablilityData.setVoxelWalkability(currentNode.coords, 1);
		for(let i = 0; i < openSet.length; i++) {
			this._voxelWalkablilityData.setVoxelWalkability(openSet[i].coords, 1);
		}
		for(let i = 0; i < closedSet.length; i++) {
			this._voxelWalkablilityData.setVoxelWalkability(closedSet[i].coords, 1);
		}

		// Get path from currentNode, which is the endNode
		let path = undefined;
		if( currentNode.coords[0] === endCoords[0] &&
			currentNode.coords[1] === endCoords[1] && 
			currentNode.coords[2] === endCoords[2]) {
			path = [];
			while (currentNode !== null) {
				path.push(currentNode.coords);
				currentNode = currentNode.parentNode;
			}
			path.reverse();
		}

		return path;
	}

	// Private methods:
	
	_getManhattenDistance(coords_1, coords_2) {
		let manhattenDistance = 
			Math.abs(coords_1[0] - coords_2[0]) +
			Math.abs(coords_1[1] - coords_2[1]) +
			Math.abs(coords_1[2] - coords_2[2]);
		return manhattenDistance;
	}
}