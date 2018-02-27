class EntityManager {
	constructor(scene, worldData) {
		this.worldData = worldData;
		this.dwarf = new Dwarf(scene, worldData);
	}

	update(mousePicker) {
		this.dwarf.update(mousePicker.getSelectedCubeCoords());
	}
}