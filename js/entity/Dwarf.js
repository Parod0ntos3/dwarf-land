class Dwarf {
	constructor(scene, worldData) {
		// Variables for moving
		this.moving = false;
		this.MOVING_SPEED = 10 / 60;
		this.targetPosition = [];
		this.movingDirection = [];
		this.distanceToNextPoint = 0;
		this.position = [Math.floor(worldData.worldSize.x / 2), 0, Math.floor(worldData.worldSize.z / 2)];
		this.position[1] = worldData.getHeight(this.position[0], this.position[2]);

		this.coords = [];
		this.updateCoords();

		this.path = [];

		// Initialize mesh
		var dwarfGeometry = new THREE.BoxGeometry( 1, 1, 1 );
		var dwarfMaterial = new THREE.MeshBasicMaterial( {color: "rgb(200, 0, 200)"} );
		this.dwarfMesh = new THREE.Mesh( dwarfGeometry, dwarfMaterial );
		scene.add( this.dwarfMesh );

		// Set start position
		this.updateMesh();
	}

	update(targetCoords) {
		if(targetCoords !== undefined && this.moving === false) {
			this.addToPath(targetCoords);
		}

		this.moveAlongPath();
		this.updateCoords();
		this.updateMesh();
	}

	updateMesh() {
		this.dwarfMesh.position.x = this.position[0];
		this.dwarfMesh.position.y = this.position[1];
		this.dwarfMesh.position.z = this.position[2];		
	}

	updateCoords() {
		this.coords = [
			Math.floor(this.position[0]),
			Math.floor(this.position[1]),
			Math.floor(this.position[2]),
		];		
	}

	getPosition() {
		return this.position;
	}

	getCoordsForPathfinder() {
		if(this.path.length > 0) {
			return this.path[this.path.length - 1];
		}
		else {
			return this.coords;			
		}
	}

	addToPath(additionalPath) {
		if(additionalPath.length > 0) {
			if(additionalPath[0].constructor === Array)
				this.path = this.path.concat(additionalPath);
			else if(this.path.length > 0)
				this.path = this.path.concat([additionalPath]);
			else if(this.path.length === 0)
				this.path = [additionalPath];
		}
	}

	moveAlongPath() {
		if(this.path.length !== 0 && this.moving === false) {
			// Calculate direction from position to path[0]
			this.movingDirection[0] = this.path[0][0] - this.position[0];
			this.movingDirection[1] = this.path[0][1] - this.position[1];
			this.movingDirection[2] = this.path[0][2] - this.position[2];

			// Calculate distance to path[0]
			this.distanceToNextPoint = Math.sqrt(
				Math.pow(this.movingDirection[0], 2) + 
				Math.pow(this.movingDirection[1], 2) + 
				Math.pow(this.movingDirection[2], 2));

			// Normalize direction
			if(this.distanceToNextPoint > 0.0001) {
				this.movingDirection[0] = this.movingDirection[0] / this.distanceToNextPoint;
				this.movingDirection[1] = this.movingDirection[1] / this.distanceToNextPoint;
				this.movingDirection[2] = this.movingDirection[2] / this.distanceToNextPoint;				
			}

			this.moving = true;
		}

		if(this.moving === true) {
			this.distanceToNextPoint -= this.MOVING_SPEED;
			if(this.distanceToNextPoint <= 0) {
				// path[0] reached, set position to path[0] and remove path[0]
				this.moving = false;
				this.position[0] = this.path[0][0];
				this.position[1] = this.path[0][1];
				this.position[2] = this.path[0][2];
				this.path.splice(0,1);
			} else {
				// Walk towards path[0]
				this.position[0] += this.MOVING_SPEED * this.movingDirection[0];
				this.position[1] += this.MOVING_SPEED * this.movingDirection[1];
				this.position[2] += this.MOVING_SPEED * this.movingDirection[2];
			}		
		}
	}
}