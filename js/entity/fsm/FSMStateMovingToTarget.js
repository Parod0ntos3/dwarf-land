class FSMStateMovingToTarget extends FSMState {
	constructor(dwarf) {
		super("MOVING_TO_TARGET_STATE");
		
		this._dwarf = dwarf;
		this._distanceToNextPoint = 0;
	}

	// Public methods:

	onEnter() {
		console.log("Entering " + this._STATE_NAME);
		this._calculateMovingDirection();
	}

	update() {
		this._distanceToNextPoint -= DWARF_MOVING_SPEED;
		if(this._distanceToNextPoint <= 0) {
			// path[0] reached, set position to path[0] and remove path[0]
			this._dwarf.position[0] = this._dwarf.path[0][0];
			this._dwarf.position[1] = this._dwarf.path[0][1];
			this._dwarf.position[2] = this._dwarf.path[0][2];
			this._dwarf.setCoords(this._dwarf.path[0]);
			this._dwarf.path.splice(0,1);

			this._calculateMovingDirection();
		} else {
			// Walk towards path[0]
			this._dwarf.position[0] += DWARF_MOVING_SPEED * this._dwarf.movingDirection[0];
			this._dwarf.position[1] += DWARF_MOVING_SPEED * this._dwarf.movingDirection[1];
			this._dwarf.position[2] += DWARF_MOVING_SPEED * this._dwarf.movingDirection[2];
		}
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}

	// Private methods:

	_calculateMovingDirection() {
		// Check if next cube is walkable, if not calculate new path or return
		if(	this._dwarf.path.length > 0 ) {
			if(this._dwarf.worldManager.getVoxelWalkability(this._dwarf.path[0]) === 0) {
				let newPath = this._dwarf.worldManager.getPath(
							this._dwarf.getCoords(),
							this._dwarf.path[this._dwarf.path.length - 1]);
				if(newPath !== undefined) {
					this._dwarf.path = newPath;
				} else {
					this._dwarf.path = [];
					this._dwarf.FSM.popState();
					return;					
				}
			}
		}

		// Calculate new movingDirection
		if(	this._dwarf.path.length > 0 ) {
			// Calculate direction from position to path[0]
			this._dwarf.movingDirection[0] = this._dwarf.path[0][0] - this._dwarf.position[0];
			this._dwarf.movingDirection[1] = this._dwarf.path[0][1] - this._dwarf.position[1];
			this._dwarf.movingDirection[2] = this._dwarf.path[0][2] - this._dwarf.position[2];

			// Calculate distance to path[0]
			this._distanceToNextPoint = Math.sqrt(
				Math.pow(this._dwarf.movingDirection[0], 2) + 
				Math.pow(this._dwarf.movingDirection[1], 2) + 
				Math.pow(this._dwarf.movingDirection[2], 2));

			// Normalize direction
			if(this._distanceToNextPoint > 0.0001) {
				this._dwarf.movingDirection[0] = this._dwarf.movingDirection[0] / this._distanceToNextPoint;
				this._dwarf.movingDirection[1] = this._dwarf.movingDirection[1] / this._distanceToNextPoint;
				this._dwarf.movingDirection[2] = this._dwarf.movingDirection[2] / this._distanceToNextPoint;				
			}
		} else {
			// Pop state
			this._dwarf.FSM.popState();
		}	
	}
}