class EntityManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);

		this.pathfinder = new Pathfinder(worldData);
	}

	update(mousePicker) {
		if(mouse.rightClicked === true && mousePicker.getSelectedCubeCoords() !== null) {
			this.dwarf.addToPath(this.pathfinder.getPath(this.dwarf.getCoordsForPathfinder(), mousePicker.getSelectedCubeCoords()));
		}

		this.dwarf.update();

	}
}