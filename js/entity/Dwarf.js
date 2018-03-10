class Dwarf {
	constructor(scene, worldManager) {
		// Variables for moving
		this.targetPosition = [];
		this.movingDirection = [];
		this.worldManager = worldManager;
		this.position = [Math.floor(worldManager.getWorldData().worldSize.x / 2), 0, Math.floor(worldManager.getWorldData().worldSize.z / 2)];
		this.position[1] = worldManager.getWorldData().getHeight(this.position[0], this.position[2]);

		this.coords = [];
		this.updateCoords();

		this.path = [];
		this.miningCoords = [];

		// Initialize mesh
		var dwarfGeometry = new THREE.BoxGeometry( 1, 1, 1 );
		var dwarfMaterial = new THREE.MeshBasicMaterial( {color: "rgb(200, 0, 200)"} );
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

	getCurrentJob() {
		return this.job;
	}

	setCurrentJob(job) {
		this.job = job;
		if(this.job !== undefined) {
			if(this.job.title === "MINING_JOB") {
				this.miningCoords = job.miningCoords;
				this.path = job.path;

				if(this.path !== undefined) {
					this.FSM.pushState(this.FSMStateMining);
					this.FSM.pushState(this.FSMStateMovingToTarget);
				} else {
					this.setCurrentJob(undefined);
				}
			}
		}
	}
}