class FSMStateWaiting extends FSMState {
	constructor(dwarf) {
		super("WAITING_STATE");
		this.dwarf = dwarf;
	}

	onEnter() {
		console.log("Entering " + this.STATE_NAME);
		this.dwarf.setCurrentJob(undefined);
	}

	update() {
		//console.log("Updating " + this.STATE_NAME);
	}

	onExit() {
		console.log("Exiting " + this.STATE_NAME);
	}
}