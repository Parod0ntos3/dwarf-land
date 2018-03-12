class DwarfManager {
	constructor(scene, worldManager) {
		this.worldManager = worldManager;
		this.dwarfs = [];
		for(let i = 0; i < 1; i++) {
			this.dwarfs[i] = new Dwarf(scene, worldManager, i);
		}
 	}

	update(mousePicker) {
		let indicesOfDwarfsWithoutJob = [];
		for(let i = 0; i < this.dwarfs.length; i++) {
			if(this.dwarfs[i].getCurrentJob() === undefined) {
				indicesOfDwarfsWithoutJob.push(i);
			}
		}

		let miningSelectionData = this.worldManager.getMiningSelectionData();
		if(miningSelectionData.selectedCoords.length > 0) {
			// Iterate through dwarfs without job and try to assign mining jobs
			iLoop: for(let i = 0; i < indicesOfDwarfsWithoutJob.length; i++) {
				// Iterate through reachable coords of selected coords and find the nearest reachable
				// coord for the current dwarf
				let nearestPath = undefined;
				let indices = {selectedCoord: undefined, reachableCoord: undefined};

				jLoop: for(let j = 0; j < miningSelectionData.walkableCoordsToReachSelectedCoords.length; j++) {
					if(	miningSelectionData.walkableCoordsToReachSelectedCoords[j].length === 0 ||
						miningSelectionData.assignedToDwarf[j] === true) {
						// Selected coord is not reachable or already assigned to another dwarf
						// -> continue with next selected coord
						continue jLoop;
					}

					kLoop: for(let k = 0; k < miningSelectionData.walkableCoordsToReachSelectedCoords[j].length; k++) {
						// TODO: Do not always calculate the path, check if reachable with clusters
						// and estimate distance with manhatten distance!
						let path = this.worldManager.getPath(
							this.dwarfs[indicesOfDwarfsWithoutJob[i]].getCoords(),
							miningSelectionData.walkableCoordsToReachSelectedCoords[j][k]);
						if(path === undefined) {
							continue kLoop;
						}

						if(nearestPath === undefined || path.length < nearestPath.length) {
							nearestPath = path;
							indices.selectedCoord = j;
							indices.reachableCoord = k;
						}
					}
				}

				if(nearestPath !== undefined) {
					miningSelectionData.assignedToDwarf[indices.selectedCoord] = this.dwarfs[i].getId();
					// Initialize miningCoords for dwarfs job with selection from indices
					let miningCoords = [miningSelectionData.selectedCoords[indices.selectedCoord]];
					// Check if there are additional selected coords that can be mined from the same reachable coord,
					// if this is the case, put this selected coord into miningCoords.
					jLoop: for(let j = 0; j < miningSelectionData.walkableCoordsToReachSelectedCoords.length; j++) {
						if( miningSelectionData.walkableCoordsToReachSelectedCoords[j].length === 0 ||
							miningSelectionData.assignedToDwarf[j] !== undefined) {
							// Selected coord is already assigned to a dwarf or selected
							// coord is not reachable -> continue with next selected coord
							continue jLoop;
						}
						for(let k = 0; k < miningSelectionData.walkableCoordsToReachSelectedCoords[j].length; k++) {
						 	if(	true === areCoordsEqual(miningSelectionData.walkableCoordsToReachSelectedCoords[j][k], 
			 											miningSelectionData.walkableCoordsToReachSelectedCoords[indices.selectedCoord][indices.reachableCoord])) {
						 		miningCoords.push(miningSelectionData.selectedCoords[j]);
							}
						}
					}

					let miningJob = {
						title: "MINING_JOB",
						miningCoords: miningCoords,
						path: nearestPath
					};
					this.dwarfs[indicesOfDwarfsWithoutJob[i]].setCurrentJob(miningJob);
				}
			}
		}


		
		for(let i = 0; i < this.dwarfs.length; i++) {
			this.dwarfs[i].update();
		}
	}
}