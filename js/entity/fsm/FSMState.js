class FSMState {
	constructor(stateName) {
		this.STATE_NAME = stateName;
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