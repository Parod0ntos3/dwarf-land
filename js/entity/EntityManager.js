class EntityManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);

		this.pathfinder = new Pathfinder(worldData);
	}

	update(mousePicker) {
		if(mouse.rightClicked === true && mousePicker.getSelectedCubeCoords() !== null) {
			let clickedCoords = [mousePicker.getSelectedCubeCoords()[0],
								 mousePicker.getSelectedCubeCoords()[1] + 1,
								 mousePicker.getSelectedCubeCoords()[2]];

			this.dwarf.addToPath(this.pathfinder.getPath(this.dwarf.getCoordsForPathfinder(), clickedCoords));
		}

		this.dwarf.update();

	}
}