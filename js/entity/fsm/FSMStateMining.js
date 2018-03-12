class FSMStateMining extends FSMState{
	constructor(dwarf) {
		super("MINING_STATE");
		this.dwarf = dwarf;
		this.miningTime = 1000;
	}

	onEnter() {
		console.log("Entering " + this.STATE_NAME);
		this.miningTime = 1000 + clock.delta;

		// Check if miningCoord is reachable
		let walkableCoordsToReachSelectedCoords = this.dwarf.worldManager.getWalkableCoordsToReachSelectedCoordsBySelectedCoord(this.dwarf.miningCoords[0]);
		let selectedCoordIsReachable = false;
		iLoop: for(let i = 0; i < walkableCoordsToReachSelectedCoords.length; i++) {
			if(areCoordsEqual(walkableCoordsToReachSelectedCoords[i], this.dwarf.getCoords()) === true) {
				selectedCoordIsReachable = true;
				break iLoop;
			}
		}

		if(selectedCoordIsReachable === false) {
			for(let i = 0; i < this.dwarf.miningCoords.length; i++) {
				this.dwarf.worldManager.deAssignMiningCoords(this.dwarf.miningCoords[i]);
				this.dwarf.worldManager.updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(this.dwarf.miningCoords[i]);
			}
			this.dwarf.FSM.popState();
		}
	}

	update() {
		this.miningTime -= clock.delta;
		if(this.miningTime <= 0) {
			this.dwarf.worldManager.removeMinedCube(this.dwarf.miningCoords[0]);
			this.dwarf.miningCoords.splice(0, 1);
			if(this.dwarf.miningCoords.length > 0) {
				this.miningTime = 1000;
			} else {
				this.dwarf.FSM.popState();
			}
		}
	}

	onExit() {
		console.log("Exiting " + this.STATE_NAME);
	}
}