class Dwarf {
	constructor(scene, worldData) {
		// Variables for moving
		this.moving = false;
		this.MOVING_SPEED = 20 / 60;
		this.targetPosition = [];
		this.direction = [];
		this.movingDistance = 0;
		this.position = [Math.floor(worldData.worldSize.x / 2), 0, Math.floor(worldData.worldSize.z / 2)];
		this.position[1] = 0.25 + worldData.getHeight(this.position[0], this.position[2]);

		// Initialize mesh
		var dwarfGeometry = new THREE.BoxGeometry( 1, 1.5, 1 );
		var dwarfMaterial = new THREE.MeshBasicMaterial( {color: "rgb(200, 0, 200)"} );
		this.dwarfMesh = new THREE.Mesh( dwarfGeometry, dwarfMaterial );
		scene.add( this.dwarfMesh );

		// Set start position
		this.updateMesh();
	}

	update(targetCoords) {
		if(targetCoords != null && this.moving === false) {
			this.targetPosition[0] = targetCoords[0];
			this.targetPosition[1] = targetCoords[1] + 1.25;
			this.targetPosition[2] = targetCoords[2];

			// Calculate direction
			this.direction[0] = this.targetPosition[0] - this.position[0];
			this.direction[1] = this.targetPosition[1] - this.position[1];
			this.direction[2] = this.targetPosition[2] - this.position[2];

			// Calculate movingDistance
			this.movingDistance = Math.sqrt(
				this.direction[0] * this.direction[0]
				+ this.direction[1] * this.direction[1]
				+ this.direction[2] * this.direction[2]
			);

			// Normalize direction
			if(this.movingDistance > 0.0001) {
				this.direction[0] = this.direction[0] / this.movingDistance;
				this.direction[1] = this.direction[1] / this.movingDistance;
				this.direction[2] = this.direction[2] / this.movingDistance;				
			}

			this.moving = true;
		}

		if(this.moving === true) {

			this.position[0] += this.MOVING_SPEED * this.direction[0];
			this.position[1] += this.MOVING_SPEED * this.direction[1];
			this.position[2] += this.MOVING_SPEED * this.direction[2];

			this.movingDistance -= this.MOVING_SPEED;

			if(this.movingDistance <= 0) {
				this.position[0] = this.targetPosition[0];
				this.position[1] = this.targetPosition[1];
				this.position[2] = this.targetPosition[2];
				this.moving = false;			
			}

			this.updateMesh();
		}
	}

	updateMesh() {
		this.dwarfMesh.position.x = this.position[0];
		this.dwarfMesh.position.y = this.position[1];
		this.dwarfMesh.position.z = this.position[2];		
	}

	getPosition() {
		return this.position;
	}
}