class DwarfManager {
	constructor(scene, worldManager) {
		this.worldData = worldManager.getWorldData();
		this.worldManager = worldManager;
		this.dwarf = new Dwarf(scene, this.worldData);
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


		if(this.worldManager.getSelectedCoords().length > 0) {
			let walkableCoordsToReachSelectedCoords = this.worldManager.getWalkableCoordsToReachSelectedCoords();
		}

		if(mouse.rightClicked === true && mousePicker.getSelectedCubeCoords() !== undefined) {
			let clickedCoords = [mousePicker.getSelectedCubeCoords()[0],
								 mousePicker.getSelectedCubeCoords()[1] + 1,
								 mousePicker.getSelectedCubeCoords()[2]];

			this.dwarf.addToPath(this.worldManager.getPath(this.dwarf.getCoordsForPathfinder(), clickedCoords));

			this.miningSelection.removeFromSelection(mousePicker.getSelectedCubeCoords());
		}

		this.dwarf.update();
	}
}