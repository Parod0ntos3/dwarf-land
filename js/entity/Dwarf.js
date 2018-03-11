class Dwarf {
	constructor(scene, worldManager) {
		// Variables for moving
		this.targetPosition = [];
		this.movingDirection = [];
		this.worldManager = worldManager;
		this.position = [Math.floor(worldManager.getWorldData().worldSize.x / 2), 0, Math.floor(worldManager.getWorldData().worldSize.z / 2)];
		this.position[1] = worldManager.getWorldData().getHeight(this.position[0], this.position[2]);

		this.coords = [
			Math.floor(this.position[0]),
			Math.floor(this.position[1]),
			Math.floor(this.position[2]),
		];

		this.path = [];
		this.miningCoords = [];

		// Initialize mesh
		let dwarfGeometry = new THREE.BoxGeometry( 1, 1, 1 );
		let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);
		let color = "rgb(" + r.toString() + "," +  g.toString() + "," + b.toString() + ")";
		let dwarfMaterial = new THREE.MeshBasicMaterial( {color: color} );
		this.dwarfMesh = new THREE.Mesh( dwarfGeometry, dwarfMaterial );
		scene.add( this.dwarfMesh );

		// Set start position
		this.updateMesh();

		// FSM and States:
		this.FSM = new FSM();
		this.FSMStateWaiting = new FSMStateWaiting(this);
		this.FSMStateMovingToTarget = new FSMStateMovingToTarget(this);
		this.FSMStateMining = new FSMStateMining(this);

		this.FSM.pushState(this.FSMStateWaiting);
		this.job = undefined;
	}

	update() {
		if(this.path.length > 0 && this.FSM.getCurrentState().STATE_NAME !== "MOVING_TO_TARGET_STATE") {
			this.FSM.pushState(this.FSMStateMovingToTarget);
		}
		this.FSM.update();

		this.updateMesh();
	}

	updateMesh() {
		this.dwarfMesh.position.x = this.position[0];
		this.dwarfMesh.position.y = this.position[1];
		this.dwarfMesh.position.z = this.position[2];		
	}

	getPosition() {
		return this.position;
	}

	getCoords() {
		return this.coords;			
	}

	setCoords(coords) {
		this.coords[0] = coords[0];
		this.coords[1] = coords[1];
		this.coords[2] = coords[2];
	}

	getCurrentJob() {
		return this.job;
	}

	setCurrentJob(job) {
		this.job = job;
		if(this.job !== undefined) {
			if(this.job.title === "MINING_JOB" && this.job.path !== undefined) {
				this.miningCoords = this.job.miningCoords;
				this.path = this.job.path;
				this.FSM.pushState(this.FSMStateMining);
				this.FSM.pushState(this.FSMStateMovingToTarget);
			} else {
				this.job = undefined;
			}
		} else {
			this.job = undefined;
		}
	}
}