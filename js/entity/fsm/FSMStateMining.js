class FSMStateMining extends FSMState{
	constructor(dwarf) {
		super("MINING_STATE");
		this.dwarf = dwarf;
		this.miningTime = 1000;
	}

	onEnter() {
		console.log("Entering " + this.STATE_NAME);
		this.miningTime = 1000 + clock.delta;
	}

	update() {
		this.miningTime -= clock.delta;
		if(this.miningTime <= 0) {
			this.dwarf.worldManager.removeMinedCube(this.dwarf.miningCoords);
			this.dwarf.FSM.popState();
		}
	}

	onExit() {
		console.log("Exiting " + this.STATE_NAME);
	}
}