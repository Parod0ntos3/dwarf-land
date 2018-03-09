class WorldManager {
	constructor(scene, camera) {
		this.worldData = new WorldData(scene);
		this.mousePicker = new MousePicker(scene, camera, this.worldData);
		this.pathfinder = new Pathfinder(this.worldData);

		this.chunkManager = undefined;

		//this.miningSelection = new MiningSelection();
	}

	update() {
		this.mousePicker.update();
		this.chunkManager.update(this.mousePicker);
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
}