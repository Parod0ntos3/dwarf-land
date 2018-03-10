class DwarfManager {
	constructor(scene, worldManager) {
		this.worldManager = worldManager;
		this.dwarfs = [];
		for(let i = 0; i < 1; i++) {
			this.dwarfs[i] = new Dwarf(scene, worldManager);
		}
 	}

	update(mousePicker) {
		// If miningSelection !== null
		//	-> get for every selected coords all coords from which dwarfs can mine the cube
		// Concept:
		//	-> if dwarf has no job: add FIRST selected coord that is reachable to dwarf:
		//		-> add mining job (selected coord)
		//		-> add walking job (to FIRST coord to reach selected coord)
		// Out of scope:
		// Find best selection and best way for dwarf
		// Update selection after world has been updated!

		let indicesOfDwarfsWithoutJob = [];
		for(let i = 0; i < 1; i++) {
			if(this.dwarfs[i].getCurrentJob() === undefined) {
				indicesOfDwarfsWithoutJob.push(i);
			}
		}


		if(this.worldManager.getSelectedCoords().length > 0) {
			let walkableCoordsToReachSelectedCoords = this.worldManager.getWalkableCoordsToReachSelectedCoords();
			// Iterate through dwarfs without job and try to assign mining jobs
			iLoop: for(let i = 0; i < indicesOfDwarfsWithoutJob.length; i++) {
				// Iterate through reachable coords of selected coords and find the nearest reachable
				// coord for the current dwarf
				let nearestPath = undefined;
				let indices = {selectedCoord: undefined, reachableCoord: undefined};

				jLoop: for(let j = 0; j < walkableCoordsToReachSelectedCoords.length; j++) {
					if(walkableCoordsToReachSelectedCoords[j].length === 0) {
						// Selected coord is not reachable -> continue with next selected coord
						continue jLoop;
					}

					kLoop: for(let k = 0; k < walkableCoordsToReachSelectedCoords[j].length; k++) {
						// TODO: Do not always calculate the path, check if reachable with clusters
						// and estimate distance with manhatten distance!
						let path = this.worldManager.getPath(
							this.dwarfs[indicesOfDwarfsWithoutJob[i]].getCoordsForPathfinder(),
							walkableCoordsToReachSelectedCoords[j][k]);
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
					let miningJob = {
						title: "MINING_JOB",
						miningCoords: this.worldManager.getSelectedCoords()[indices.selectedCoord],
						path: nearestPath
					};

					this.dwarfs[i].setCurrentJob(miningJob);
				}
			}
		}


		
		for(let i = 0; i < 1; i++) {
			this.dwarfs[i].update();
		}
	}
}