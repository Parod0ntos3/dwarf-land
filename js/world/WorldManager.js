class WorldManager {
	constructor(scene, camera) {
		this._voxelTypeData = new VoxelTypeData();
		this._voxelWalkablilityData = new VoxelWalkabilityData(scene, this._voxelTypeData);

		this._chunkManager = undefined;

		this._mousePicker = new MousePicker(scene, camera, this._voxelTypeData);
		this._pathfinder = new Pathfinder(this._voxelTypeData, this._voxelWalkablilityData);
		this._miningSelection = new MiningSelection(scene, this._voxelTypeData, this._voxelWalkablilityData);
	}

	// Public methods:

	update() {
		this._mousePicker.update();
		this._chunkManager.update(this._mousePicker);
		this._miningSelection.update(this._mousePicker);
	}

	updateWorldData(coords, type) {
		this._voxelTypeData.setVoxelType(coords, type);
		for(let y = -2; y <= 0; y++) {
			this._voxelWalkablilityData.updateVoxelWalkability([coords[0], coords[1] + y, coords[2]]);
		}
		this._voxelWalkablilityData.updateVoxelWalkablilityVisualisation();
	}

	getVoxelType(coords) {
		return this._voxelTypeData.getVoxelType(coords);
	}

	getVoxelWalkability(coords) {
		return this._voxelWalkablilityData.getVoxelWalkability(coords);
	}

	getMousePicker() {
		return this._mousePicker;
	}

	getvoxelTypeData() {
		return this._voxelTypeData;
	}

	getVoxelWalkabilityData() {
		return this._voxelWalkablilityData;
	}

	getPath(startCoords, endCoords) {
		return this._pathfinder.getPath(startCoords, endCoords);
	}

	initializeChunkManager(texture, scene) {
		this._chunkManager = new ChunkManager(chunkManagerTexture, scene, this._voxelTypeData, this);		
	}

	getMiningSelectionData() {
		return this._miningSelection.getMiningSelectionData();
	}

	getWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		return this._miningSelection.getWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords);
	}

	deAssignMiningCoords(coords) {
		this._miningSelection.deAssignMiningCoords(coords);
	}

	updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		this._miningSelection.updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords);		
	}

	removeMinedVoxel(coords) {
		// Order of calls is important for updating the reachability of selected coords!
		this.updateWorldData(coords, VOXEL_TYPE.AIR);
		this._chunkManager.changeWorldData(coords);
		this._miningSelection.removeCoordsFromSelection(coords);
	}

	getHeight(x, z) {
		return this._voxelTypeData.getHeight(x, z);
	}
}