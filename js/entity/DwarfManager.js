class DwarfManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);

		this.pathfinder = new Pathfinder(worldData);
		this.miningSelection = new MiningSelection(scene);
 	}

	update(mousePicker) {
		this.miningSelection.update(mousePicker);

		// If miningSelection !== null
		//	-> get for every selected coords all coords from which dwarfs can mine the cube
		// Concept:
		//	-> if dwarf has no job: add FIRST selected coord that is reachable to dwarf:
		//		-> add mining job (selected coord)
		//		-> add walking job (to FIRST coord to reach selected coord)
		// Out of scope:
		// Find best selection and best way for dwarf
		// Update selection after world has been updated!


		if(this.miningSelection.getSelectedCoords().length > 0) {
			let walkableCoordsToReachSelectedCoords = this.getWalkableCoordsToReachSelectedCoords(this.miningSelection.getSelectedCoords());
		}

		if(mouse.rightClicked === true && mousePicker.getSelectedCubeCoords() !== undefined) {
			let clickedCoords = [mousePicker.getSelectedCubeCoords()[0],
								 mousePicker.getSelectedCubeCoords()[1] + 1,
								 mousePicker.getSelectedCubeCoords()[2]];

			this.dwarf.addToPath(this.pathfinder.getPath(this.dwarf.getCoordsForPathfinder(), clickedCoords));

			this.miningSelection.removeFromSelection(mousePicker.getSelectedCubeCoords());
		}

		this.dwarf.update();
	}

	getWalkableCoordsToReachSelectedCoords(selectedCoords) {
		let walkableCoordsToReachSelectedCoords = [];
		iLoop: for(let i = 0; i < selectedCoords.length; i++) {
			// Check if all (face-) neighbors are solid, if so, selectedCoords[i] is not reachable
			let neighborsTypes = this.worldData.getNeighborsTypes(selectedCoords[i]);
			let allNeighborsAreSolid = true;
			for(let j = 0; j < 6; j++) {
				// Check if neighbor cube is solid
				if( neighborsTypes[j] !== this.worldData.CUBE_TYPE_AIR && 
					neighborsTypes[j] !== this.worldData.CUBE_TYPE_WATER) {
				} else {
				   	allNeighborsAreSolid = false;
				}
			}

			if(allNeighborsAreSolid === true) {
				continue iLoop;
			}

			// Convention: mining is only possible over faces, not over corners
			// Mining is only possible, if standing:
			// 		-> CASE 1: x+1/x-1 or z+1/z-1 with y-1/y
			//					-> Check if walkable and coords reachable
			//					-> minable and reachable
			//		-> CASE 2: x+1/x-1 or z+1/z-1 with y+1		
			//					-> Check if cube above is walkable (+2 instead of nonSolid) and coords walkable and reachable
			//					-> minable and reachable
			//		-> CASE 3: x and z and y-2
			//					-> Check if walkable and coords reachable
			//					-> minable and reachable

			let walkableNeighborsToReachCurrentSelectedCube = [];
			yLoop: for(let y = -1; y <= 1; y++) {
				// Check additional condition of CASE 2
				if(y === 1) {
					let cubeWalkabilityOfCubeAboveSelected = this.worldData.getCubeWalkability([selectedCoords[i][0], selectedCoords[i][1] + y, selectedCoords[i][2]]);
					if(cubeWalkabilityOfCubeAboveSelected === 0) {
						break yLoop;
					}
				}
				// Loops for CASE 1 and CASE 2
				let faceNeighbors = [{x: -1, z: 0}, {x: 0, z: -1}, {x: 1, z: 0}, {x: 0, z: 1}]
				for(let j = 0; j < faceNeighbors.length; j++) {
					let coordsNextToSelected = [
						selectedCoords[i][0] + faceNeighbors[j].x,
						selectedCoords[i][1] + y,
						selectedCoords[i][2] + faceNeighbors[j].z
					];

					if(this.worldData.getCubeWalkability(coordsNextToSelected) !== 0) {
						walkableNeighborsToReachCurrentSelectedCube.push(coordsNextToSelected);
					}
				}
			}

			// Check condition for CASE 3:
			let coordsTwoVoxelsBelowSelected = [selectedCoords[i][0], selectedCoords[i][1] - 2, selectedCoords[i][2]];
			if(this.worldData.getCubeWalkability(coordsTwoVoxelsBelowSelected) !== 0) {
				walkableNeighborsToReachCurrentSelectedCube.push(coordsTwoVoxelsBelowSelected);				
			}

			walkableCoordsToReachSelectedCoords.push(walkableNeighborsToReachCurrentSelectedCube);
		}
		return walkableCoordsToReachSelectedCoords;
	}
}