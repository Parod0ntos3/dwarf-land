class EntityManager {
	constructor(scene, worldData) {
		this.dwarf = new Dwarf(scene, worldData);
	}

	update(mouseIntersectionCoords) {
		this.dwarf.update(mouseIntersectionCoords);
	}
}