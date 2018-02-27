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
		while ((currentNode.coords[0] !== endCoords[0] || 
				currentNode.coords[1] !== endCoords[1] || 
				currentNode.coords[2] !== endCoords[2]) &&
				openSet.length > 0) {
			// Iterate through neighbor nodes and put them into openSet if walkable.
			xLoop: for(let x = -1; x <= 1; x++) {
				zLoop: for(let z = -1; z <= 1; z++) {
					yLoop: for(let y = 1; y >= -1; y--) {
						if(x !== 0 || z !== 0) {
							let coords = [currentNode.coords[0] + x, currentNode.coords[1] + y, currentNode.coords[2] + z];
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
				}
			}

			// Put current field into the closedSet
			closedSet.push(currentNode);

			// Choose field with the lowest costs from the openSet as currentNode for next iteration and remove it from openSet
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

		console.log(closedSet);
		console.log(openSet);
		console.log(path);
	}

	getManhattenDistance(coords_1, coords_2) {
		let manhattenDistance = 
			Math.abs(coords_1[0] - coords_2[0]) +
			Math.abs(coords_1[1] - coords_2[1]) +
			Math.abs(coords_1[2] - coords_2[2]);
		return manhattenDistance;
	}

	//pathfinder.getPath([109,69,123], [109,69,127])
}