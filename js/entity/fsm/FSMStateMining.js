class FSMStateMining extends FSMState{
	constructor(dwarf, worldManager) {
		super("MINING_STATE");
		this._dwarf = dwarf;
		this._worldManager = worldManager;
		this._miningTime = 1000;
	}

	// Public methods:

	onEnter() {
		console.log("Entering " + this._STATE_NAME);
		this._miningTime = 1000 + clock.delta;

		// Check if miningCoord is reachable
		let walkableCoordsToReachSelectedCoords = this._worldManager.getWalkableCoordsToReachSelectedCoordsBySelectedCoord(this._dwarf.getMiningCoordsByIndex(0));
		let selectedCoordIsReachable = false;
		iLoop: for(let i = 0; i < walkableCoordsToReachSelectedCoords.length; i++) {
			if(areCoordsEqual(walkableCoordsToReachSelectedCoords[i], this._dwarf.getCoords()) === true) {
				selectedCoordIsReachable = true;
				break iLoop;
			}
		}

		if(selectedCoordIsReachable === false) {
			for(let i = 0; i < this._dwarf.getNumberOfMiningCoords(); i++) {
				this._worldManager.deAssignMiningCoords(this._dwarf.getMiningCoordsByIndex(i));
				this._worldManager.updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(this._dwarf.getMiningCoordsByIndex(i));
			}
			this._dwarf.getFSM().popState();
		}
	}

	update() {
		this._miningTime -= clock.delta;
		if(this._miningTime <= 0) {
			this._worldManager.removeMinedVoxel(this._dwarf.getMiningCoordsByIndex(0));
			this._dwarf.removeMiningCoordsAtIndex(0);
			if(this._dwarf.getNumberOfMiningCoords() > 0) {
				this._miningTime = 1000;
			} else {
				this._dwarf.getFSM().popState();
			}
		}
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}
}