class FSMStateMovingToTarget extends FSMState {
	constructor(dwarf, worldManager) {
		super("MOVING_TO_TARGET_STATE");
		
		this._dwarf = dwarf;
		this._worldManager = worldManager;

		this._distanceToNextPoint = 0;
		this._movingDirection = [0, 0, 0];
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
			this._dwarf.setPosition(this._dwarf.getPathCoordsByIndex(0));
			this._dwarf.setCoords(this._dwarf.getPathCoordsByIndex(0));
			this._dwarf.removeCoordsFromPathAtIndex(0);

			this._calculateMovingDirection();
		} else {
			// Walk towards path[0]
			let position = this._dwarf.getPosition();
			position[0] += DWARF_MOVING_SPEED * this._movingDirection[0];
			position[1] += DWARF_MOVING_SPEED * this._movingDirection[1];
			position[2] += DWARF_MOVING_SPEED * this._movingDirection[2];
			this._dwarf.setPosition(position);
		}
	}

	onExit() {
		console.log("Exiting " + this._STATE_NAME);
	}

	// Private methods:

	_calculateMovingDirection() {
		// Check if next cube is walkable, if not calculate new path or return
		if(	this._dwarf.getPathLength() > 0 ) {
			if(this._worldManager.getVoxelWalkability(this._dwarf.getPathCoordsByIndex(0)) === 0) {
				let newPath = this._worldManager.getPath(
							this._dwarf.getCoords(),
							this._dwarf.getPathCoordsByIndex(this._dwarf.getPathLength() - 1));
				if(newPath !== undefined) {
					this._dwarf.setPath(newPath);
				} else {
					this._dwarf.setPath([]);
					this._dwarf.getFSM().popState();
					return;					
				}
			}
		}

		// Calculate new movingDirection
		if(	this._dwarf.getPathLength() > 0 ) {
			// Calculate direction from position to path[0]
			let nextCoordsInPath = this._dwarf.getPathCoordsByIndex(0);
			let position = this._dwarf.getPosition();
			this._movingDirection[0] = nextCoordsInPath[0] - position[0];
			this._movingDirection[1] = nextCoordsInPath[1] - position[1];
			this._movingDirection[2] = nextCoordsInPath[2] - position[2];

			// Calculate distance to path[0]
			this._distanceToNextPoint = Math.sqrt(
				Math.pow(this._movingDirection[0], 2) + 
				Math.pow(this._movingDirection[1], 2) + 
				Math.pow(this._movingDirection[2], 2));

			// Normalize direction
			if(this._distanceToNextPoint > 0.0001) {
				this._movingDirection[0] = this._movingDirection[0] / this._distanceToNextPoint;
				this._movingDirection[1] = this._movingDirection[1] / this._distanceToNextPoint;
				this._movingDirection[2] = this._movingDirection[2] / this._distanceToNextPoint;				
			}

			this._dwarf.setMovingDirection(this._movingDirection);
		} else {
			// Pop state
			this._dwarf.getFSM().popState();
		}	
	}
}