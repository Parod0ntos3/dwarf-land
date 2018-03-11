class FSMStateMovingToTarget extends FSMState {
	constructor(dwarf) {
		super("MOVING_TO_TARGET_STATE");
		
		this.dwarf = dwarf;

		this.MOVING_SPEED = 10 / 60;
		this.distanceToNextPoint = 0;
	}

	onEnter() {
		console.log("Entering " + this.STATE_NAME);
		this.calculateMovingDirection();
	}

	update() {
		this.distanceToNextPoint -= this.MOVING_SPEED;
		if(this.distanceToNextPoint <= 0) {
			// path[0] reached, set position to path[0] and remove path[0]
			this.dwarf.position[0] = this.dwarf.path[0][0];
			this.dwarf.position[1] = this.dwarf.path[0][1];
			this.dwarf.position[2] = this.dwarf.path[0][2];
			this.dwarf.setCoords(this.dwarf.path[0]);
			this.dwarf.path.splice(0,1);

			this.calculateMovingDirection();
		} else {
			// Walk towards path[0]
			this.dwarf.position[0] += this.MOVING_SPEED * this.dwarf.movingDirection[0];
			this.dwarf.position[1] += this.MOVING_SPEED * this.dwarf.movingDirection[1];
			this.dwarf.position[2] += this.MOVING_SPEED * this.dwarf.movingDirection[2];
		}
	}

	calculateMovingDirection() {
		// Check if next cube is walkable, if not calculate new path or return
		if(	this.dwarf.path.length > 0 ) {
			if(this.dwarf.worldManager.getCubeWalkability(this.dwarf.path[0]) === 0) {
				let newPath = this.dwarf.worldManager.getPath(
							this.dwarf.getCoords(),
							this.dwarf.path[this.dwarf.path.length - 1]);
				if(newPath !== undefined) {
					this.dwarf.path = newPath;
				} else {
					this.dwarf.path = [];
					this.dwarf.FSM.popState();
					return;					
				}
			}
		}

		// Calculate new movingDirection
		if(	this.dwarf.path.length > 0 ) {
			// Calculate direction from position to path[0]
			this.dwarf.movingDirection[0] = this.dwarf.path[0][0] - this.dwarf.position[0];
			this.dwarf.movingDirection[1] = this.dwarf.path[0][1] - this.dwarf.position[1];
			this.dwarf.movingDirection[2] = this.dwarf.path[0][2] - this.dwarf.position[2];

			// Calculate distance to path[0]
			this.distanceToNextPoint = Math.sqrt(
				Math.pow(this.dwarf.movingDirection[0], 2) + 
				Math.pow(this.dwarf.movingDirection[1], 2) + 
				Math.pow(this.dwarf.movingDirection[2], 2));

			// Normalize direction
			if(this.distanceToNextPoint > 0.0001) {
				this.dwarf.movingDirection[0] = this.dwarf.movingDirection[0] / this.distanceToNextPoint;
				this.dwarf.movingDirection[1] = this.dwarf.movingDirection[1] / this.distanceToNextPoint;
				this.dwarf.movingDirection[2] = this.dwarf.movingDirection[2] / this.distanceToNextPoint;				
			}
		} else {
			// Pop state
			this.dwarf.FSM.popState();
		}	
	}

	onExit() {
		console.log("Exiting " + this.STATE_NAME);
	}
}