class Dwarf {
	constructor(scene, worldManager, id) {
		this._id = id;

		// Variables for moving
		this._movingDirection = [];
		this._worldManager = worldManager;
		this._position = [Math.floor(WORLD_SIZE.x / 2) + id, 0, Math.floor(WORLD_SIZE.z / 2) + id];
		this._position[1] = worldManager.getHeight(this._position[0], this._position[2]) - 1;

		this.coords = [
			Math.floor(this._position[0]),
			Math.floor(this._position[1]),
			Math.floor(this._position[2]),
		];

		this._path = [];
		this._miningCoords = [];

		// Initialize mesh
		let dwarfGeometry = new THREE.BoxGeometry( 1, 1, 1 );
		let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);
		let color = "rgb(" + r.toString() + "," +  g.toString() + "," + b.toString() + ")";
		let dwarfMaterial = new THREE.MeshBasicMaterial( {color: color} );
		this._dwarfMesh = new THREE.Mesh( dwarfGeometry, dwarfMaterial );
		scene.add( this._dwarfMesh );

		// Set start position
		this._updateMesh();

		// FSM and States:
		this._FSM = new FSM();
		this._FSMStateWaiting = new FSMStateWaiting(this, worldManager);
		this._FSMStateMovingToTarget = new FSMStateMovingToTarget(this, worldManager);
		this._FSMStateMining = new FSMStateMining(this, worldManager);

		this._FSM.pushState(this._FSMStateWaiting);
		this._job = undefined;
	}

	// Public methods:

	update() {
		if(this._path.length > 0 && this._FSM.getCurrentStateName() !== "MOVING_TO_TARGET_STATE") {
			this._FSM.pushState(this._FSMStateMovingToTarget);
		}
		this._FSM.update();

		this._updateMesh();
	}

	getId() {
		return this._id;
	}

	getPosition() {
		return this._position;
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
		return this._job;
	}

	setCurrentJob(job) {
		this._job = job;
		if(this._job !== undefined) {
			if(this._job.title === "MINING_JOB" && this._job.path !== undefined) {
				this._miningCoords = this._job.miningCoords;
				this._path = this._job.path;
				this._FSM.pushState(this._FSMStateMining);
				this._FSM.pushState(this._FSMStateMovingToTarget);
			} else {
				this._job = undefined;
			}
		} else {
			this._job = undefined;
		}
	}

	getFSM() {
		return this._FSM;
	}

	// Public methods for mining state:

	getMiningCoordsByIndex(index) {
		return this._miningCoords[index];
	}

	getNumberOfMiningCoords() {
		return this._miningCoords.length;
	}

	removeMiningCoordsAtIndex(index) {
		this._miningCoords.splice(index, 1);		
	}

	// Public methods for moving state:

	getPathLength() {
		return this._path.length;
	}

	getPathCoordsByIndex(index) {
		return this._path[index];
	}

	removeCoordsFromPathAtIndex(index) {
		this._path.splice(index, 1);		
	}

	setPath(path) {
		this._path = path;
	}

	setPosition(position) {
		this._position[0] = position[0];
		this._position[1] = position[1];
		this._position[2] = position[2];
	}

	getMovingDirection() {
		return this._movingDirection;
	}

	setMovingDirection(movingDirection) {
		this._movingDirection = movingDirection;
	}

	// Private methods:

	_updateMesh() {
		this._dwarfMesh.position.x = this._position[0];
		this._dwarfMesh.position.y = this._position[1] + 1;
		this._dwarfMesh.position.z = this._position[2];		
	}
}