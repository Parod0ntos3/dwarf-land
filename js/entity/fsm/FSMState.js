class FSMState {
	constructor(stateName) {
		this._STATE_NAME = stateName;
	}

	// Public methods:

	onEnter() {
		console.log("Entering " + this._STATE_NAME);
	}

	update() {
		console.log("Updating " + this._STATE_NAME);
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}

	getStateName() {
		return this._STATE_NAME;
	}
}