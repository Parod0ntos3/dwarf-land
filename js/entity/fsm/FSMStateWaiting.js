class FSMStateWaiting extends FSMState {
	constructor(dwarf) {
		super("WAITING_STATE");
		this._dwarf = dwarf;
	}

	// Public methods:

	onEnter() {
		console.log("Entering " + this._STATE_NAME);
		this._dwarf.setCurrentJob(undefined);
	}

	update() {
		//console.log("Updating " + this.STATE_NAME);
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}
}