class WorldManager {
	constructor(scene, camera) {
		this.voxelTypeData = new VoxelTypeData();
		this.voxelWalkablilityData = new VoxelWalkabilityData(this.voxelTypeData);

		this.chunkManager = undefined;

		this.mousePicker = new MousePicker(scene, camera, this.voxelTypeData);
		this.pathfinder = new Pathfinder(this.voxelTypeData, this.voxelWalkablilityData);
		this.miningSelection = new MiningSelection(scene, this.voxelTypeData, this.voxelWalkablilityData);
	}

	update() {
		this.mousePicker.update();
		this.chunkManager.update(this.mousePicker);
		this.miningSelection.update(this.mousePicker);
	}

	updateWorldData(coords, type) {
		this.voxelTypeData.setVoxelType(coords, type);
		for(let y = -1; y <= 1; y++) {
			this.voxelWalkablilityData.updateVoxelWalkability([coords[0], coords[1] + y, coords[2]]);
		}
	}

	getVoxelType(coords) {
		return this.voxelTypeData.getVoxelType(coords);
	}

	getVoxelWalkability(coords) {
		return this.voxelWalkablilityData.getVoxelWalkability(coords);
	}

	getMousePicker() {
		return this.mousePicker;
	}

	getvoxelTypeData() {
		return this.voxelTypeData;
	}

	getVoxelWalkabilityData() {
		return this.voxelWalkablilityData;
	}

	getPath(startCoords, endCoords) {
		return this.pathfinder.getPath(startCoords, endCoords);
	}

	initializeChunkManager(texture, scene) {
		this.chunkManager = new ChunkManager(chunkManagerTexture, scene, this.voxelTypeData, this);		
	}

	getMiningSelectionData() {
		return this.miningSelection.getMiningSelectionData();
	}

	getWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		return this.miningSelection.getWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords);
	}

	deAssignMiningCoords(coords) {
		this.miningSelection.deAssignMiningCoords(coords);
	}

	updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		this.miningSelection.updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords);		
	}

	removeMinedVoxel(coords) {
		// Order of calls is important for updating the reachability of selected coords!
		this.updateWorldData(coords, VOXEL_TYPE.AIR);
		this.chunkManager.changeWorldData(coords);
		this.miningSelection.removeCoordsFromSelection(coords);
	}

	getHeight(x, z) {
		return this.voxelTypeData.getHeight(x, z);
	}
}