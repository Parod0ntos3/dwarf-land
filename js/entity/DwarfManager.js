class DwarfManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);

		this.pathfinder = new Pathfinder(worldData);
		this.miningSelection = new MiningSelection(scene);
 	}

	update(mousePicker) {
		this.miningSelection.update(mousePicker);

		// concept:
		// If miningSelection !== null
		//	-> look if selection is reachable
		//	-> give dwarf job mining
		//	-> mining job pushes walking state to the top (walking to the target)

		if(this.miningSelection.getSelectedCoords().length > 0) {
			let reachableSelection = this.getReachableSelectedCoords(this.miningSelection.getSelectedCoords());	
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

	getReachableSelectedCoords(selectedCoords) {
		iLoop: for(let i = 0; i < selectedCoords.length; i++) {

			let neighborsTypes = this.worldData.getNeighborsTypes(selectedCoords[i]);
			let isNeighborSolidArray = [];
			let allNeighborsAreSolid = true;
			for(let j = 0; j < 6; j++) {
				// Check if neighbor cube is solid
				if( neighborsTypes[j] !== this.worldData.CUBE_TYPE_AIR && 
					neighborsTypes[j] !== this.worldData.CUBE_TYPE_WATER) {
				   	isNeighborSolidArray.push(true);
				} else {
				   	isNeighborSolidArray.push(false);
				   	allNeighborsAreSolid = false;
				}
			}

			if(allNeighborsAreSolid === true) {
				continue iLoop;
			}

			// Cases:
			// Standing next to the cube:
			//		- standing one layer up
			//		- on the same layer
			//		- one layer down
			//		- standing directly under the cube

			let walkableNeighborsWhichReachCube = [];
			for(let x = -1; x <= 1; x++) {
				for(let z = -1; z <= 1; z++) {
					for(let y = -1; y <= 2; y++) {
						let coords = [
							selectedCoords[i][0] + x,
							selectedCoords[i][1] + y,
							selectedCoords[i][2] + z
						]
						if(this.worldData.getCubeWalkability(coords) === 1) {
							walkableNeighborsWhichReachCube.push(coords);
						}
						. . .
						. . .
						. . .
					}
				}				
			}
		}
	}
}