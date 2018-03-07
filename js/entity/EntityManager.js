class EntityManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);

		this.pathfinder = new Pathfinder(worldData);
		this.miningSelection = new MiningSelection(scene);
	}

	update(mousePicker) {
		this.miningSelection.update(mousePicker);

		if(mouse.rightClicked === true && mousePicker.getSelectedCubeCoords() !== undefined) {
			let clickedCoords = [mousePicker.getSelectedCubeCoords()[0],
								 mousePicker.getSelectedCubeCoords()[1] + 1,
								 mousePicker.getSelectedCubeCoords()[2]];

			this.dwarf.addToPath(this.pathfinder.getPath(this.dwarf.getCoordsForPathfinder(), clickedCoords));

			this.miningSelection.removeFromSelection(mousePicker.getSelectedCubeCoords());
		}

		this.dwarf.update();
	}
}