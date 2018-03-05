class Pathfinder {
	constructor(worldData) {
		this.worldData = worldData;
	}

	getPath(startCoords, endCoords) {
		let closedSet = [];
		let openSet = [];

		let currentNode = { coords: startCoords,
							parentNode: null, 
							costs: this.getManhattenDistance(startCoords, endCoords) };
		openSet.push(currentNode);
		this.worldData.setCubeWalkability(startCoords, 0);

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
						if(worldData.getCubeType([currentNode.coords[0],
												  currentNode.coords[1] + 2,
												  currentNode.coords[2]]) !== worldData.CUBE_TYPE_AIR) {
							continue yLoop;
						}
					} else if(y === -1) {
						if(worldData.getCubeType([coords[0],
												  coords[1] + 2,
												  coords[2]]) !== worldData.CUBE_TYPE_AIR) {
							break yLoop;
						}
					}
					
					if(this.worldData.getCubeWalkability(coords) === 1) {
						// Calculate f = g + h, where g are the costs from the start to
						// the current field and h are the estimated costs to the target
						let fCosts = this.getManhattenDistance(startCoords, coords)
									 + this.getManhattenDistance(endCoords, coords);
						openSet.push({coords: coords, parentNode: currentNode, costs: fCosts});

						this.worldData.setCubeWalkability(coords, 0);

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

		// Reset walkability in worldData
		this.worldData.setCubeWalkability(currentNode.coords, 1);
		for(let i = 0; i < openSet.length; i++) {
			this.worldData.setCubeWalkability(openSet[i].coords, 1);
		}
		for(let i = 0; i < closedSet.length; i++) {
			this.worldData.setCubeWalkability(closedSet[i].coords, 1);
		}

		// Get path from currentNode, which is the endNode
		let path = [];
		if( currentNode.coords[0] === endCoords[0] &&
			currentNode.coords[1] === endCoords[1] && 
			currentNode.coords[2] === endCoords[2]) {
			while (currentNode !== null) {
				path.push(currentNode.coords);
				currentNode = currentNode.parentNode;
			}
		}
		path.reverse();

		/*console.log("Pathfinder:")
		console.log(closedSet);
		console.log(openSet);
		console.log(path);*/

		return path;
	}

	getManhattenDistance(coords_1, coords_2) {
		let manhattenDistance = 
			Math.abs(coords_1[0] - coords_2[0]) +
			Math.abs(coords_1[1] - coords_2[1]) +
			Math.abs(coords_1[2] - coords_2[2]);
		return manhattenDistance;
	}
}