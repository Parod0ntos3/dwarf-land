class FSMStateWaiting extends FSMState {
	constructor(dwarf) {
		super("WAITING_STATE");
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