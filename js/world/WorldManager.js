class WorldManager {
	constructor(scene, camera) {
		this.worldData = new WorldData(scene);

		this.chunkManager = undefined;

		this.mousePicker = new MousePicker(scene, camera, this.worldData);
		this.pathfinder = new Pathfinder(this.worldData);
		this.miningSelection = new MiningSelection(scene, this.worldData);
	}

	update() {
		this.mousePicker.update();
		this.chunkManager.update(this.mousePicker);
		this.miningSelection.update(this.mousePicker);
	}

	getCubeType(coords) {
		return this.worldData.getCubeType(coords);
	}

	getCubeWalkability(coords) {
		return this.worldData.getCubeWalkability(coords);
	}

	isCubeSolid(coords) {
		return this.worldData.isCubeSolid(coords);
	}

	getMousePicker() {
		return this.mousePicker;
	}

	getWorldData() {
		return this.worldData;
	}

	getPath(startCoords, endCoords) {
		return this.pathfinder.getPath(startCoords, endCoords);
	}

	initializeChunkManager(texture, scene) {
		this.chunkManager = new ChunkManager(chunkManagerTexture, scene, this.worldData);		
	}

	getSelectedCoords() {
		return this.miningSelection.getSelectedCoords();
	}

	getWalkableCoordsToReachSelectedCoords() {
		return this.miningSelection.getWalkableCoordsToReachSelectedCoords();
	}

	removeMinedCube(coords) {
		// Order of calls is important for updating the reachability of selected coords!
		this.chunkManager.changeWorldData(coords);
		this.miningSelection.removeCoordsFromSelection(coords);
	}
}