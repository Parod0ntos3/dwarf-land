class FSMStateMining extends FSMState{
	constructor(dwarf) {
		super("MINING_STATE");
	}

	onEnter() {
		console.log("Entering " + this.STATE_NAME);
	}

	update() {
		console.log("Updating " + this.STATE_NAME);
	}

	onExit() {
		console.log("Exiting " + this.STATE_NAME);
	}
}