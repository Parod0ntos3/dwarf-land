class FSMStateMining extends FSMState{
	constructor(dwarf) {
		super("MINING_STATE");
		this._dwarf = dwarf;
		this._miningTime = 1000;
	}

	// Public methods:

	onEnter() {
		console.log("Entering " + this._STATE_NAME);
		this._miningTime = 1000 + clock.delta;

		// Check if miningCoord is reachable
		let walkableCoordsToReachSelectedCoords = this._dwarf.worldManager.getWalkableCoordsToReachSelectedCoordsBySelectedCoord(this._dwarf.miningCoords[0]);
		let selectedCoordIsReachable = false;
		iLoop: for(let i = 0; i < walkableCoordsToReachSelectedCoords.length; i++) {
			if(areCoordsEqual(walkableCoordsToReachSelectedCoords[i], this._dwarf.getCoords()) === true) {
				selectedCoordIsReachable = true;
				break iLoop;
			}
		}

		if(selectedCoordIsReachable === false) {
			for(let i = 0; i < this._dwarf.miningCoords.length; i++) {
				this._dwarf.worldManager.deAssignMiningCoords(this._dwarf.miningCoords[i]);
				this._dwarf.worldManager.updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(this._dwarf.miningCoords[i]);
			}
			this._dwarf.FSM.popState();
		}
	}

	update() {
		this._miningTime -= clock.delta;
		if(this._miningTime <= 0) {
			this._dwarf.worldManager.removeMinedVoxel(this._dwarf.miningCoords[0]);
			this._dwarf.miningCoords.splice(0, 1);
			if(this._dwarf.miningCoords.length > 0) {
				this._miningTime = 1000;
			} else {
				this._dwarf.FSM.popState();
			}
		}
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}
}