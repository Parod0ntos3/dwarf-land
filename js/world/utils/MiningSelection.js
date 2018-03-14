class MiningSelection{
	constructor(scene, voxelTypesData, voxelWalkablilityData) {
		this._selectedCoords = [];
		this._walkableCoordsToReachSelectedCoords = [];
		this._assignedToDwarf = [];
		this._meshIsAddedToScene = false;
		this._scene = scene;

		this._voxelTypesData = voxelTypesData;
		this._voxelWalkablilityData = voxelWalkablilityData;
	}

	// Public methods:

	update(mousePicker) {
		if(keyboard.sTipped && mousePicker.getSelectedVoxelCoords() !== undefined) {
			let index = this._getIndexOfCoordsInSelectedCoordsArray(mousePicker.getSelectedVoxelCoords());
			if(index === undefined) {
				this._selectedCoords.push(mousePicker.getSelectedVoxelCoords());
				this._assignedToDwarf.push(undefined);
				this._updateAllWalkableCoordsToReachSelectedCoords();
				this._updateRenderMesh();
			}
		} 
	}

	getMiningSelectionData() {
		return {
			selectedCoords: this._selectedCoords,
			walkableCoordsToReachSelectedCoords: this._walkableCoordsToReachSelectedCoords,
			assignedToDwarf: this._assignedToDwarf
		};
	}

	getWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		for(let i = 0; i < this._selectedCoords.length; i++) {
			if( areCoordsEqual(coords, this._selectedCoords[i]) === true ) {
				return this._walkableCoordsToReachSelectedCoords[i];
			}
		}
	}

	deAssignMiningCoords(coords) {
		iLoop: for(let i = 0; i < this._selectedCoords.length; i++) {
			if( areCoordsEqual(coords, this._selectedCoords[i]) === true ) {
				this._assignedToDwarf[i] = undefined;
				break iLoop;
			}
		}
	}

	updateWalkableCoordsToReachSelectedCoordsBySelectedCoord(coords) {
		iLoop: for(let i = 0; i < this._selectedCoords.length; i++) {
			if( areCoordsEqual(coords, this._selectedCoords[i]) === true ) {
				this._walkableCoordsToReachSelectedCoords[i] = this._getWalkableCoordsToReachSelectedCoordsByIndex(i);
				break iLoop;
			}
		}		
	}

	removeCoordsFromSelection(coords) {
		let index = this._getIndexOfCoordsInSelectedCoordsArray(coords);
		if(index !== undefined) {
				this._selectedCoords.splice(index, 1);
				this._assignedToDwarf.splice(index, 1);
				this._updateAllWalkableCoordsToReachSelectedCoords();
				this._updateRenderMesh();
		}		
	}

	// Private methods:

	_getIndexOfCoordsInSelectedCoordsArray(coords) {
		for(let i = 0; i < this._selectedCoords.length; i++) {
			if(areCoordsEqual(coords, this._selectedCoords[i]) === true) {
				return i;
			}
		}
		return undefined;
	}

	_updateAllWalkableCoordsToReachSelectedCoords() {
		this._walkableCoordsToReachSelectedCoords = [];
		for(let i = 0; i < this._selectedCoords.length; i++) {
			this._walkableCoordsToReachSelectedCoords.push(this._getWalkableCoordsToReachSelectedCoordsByIndex(i));
		}
	}	

	_getWalkableCoordsToReachSelectedCoordsByIndex(index) {
		// Check if all (face-) neighbors are solid, if so, selectedCoords[index] is not reachable
		let neighborsTypes = this._voxelTypesData.getNeighborsTypes(this._selectedCoords[index]);
		let allNeighborsAreSolid = true;
		for(let j = 0; j < 6; j++) {
			// Check if neighbor voxel is solid
			if( neighborsTypes[j] !== VOXEL_TYPE.AIR && 
				neighborsTypes[j] !== VOXEL_TYPE.WATER) {
			} else {
			   	allNeighborsAreSolid = false;
			}
		}

		if(allNeighborsAreSolid === true) {
			return [];
		}

		// Convention: mining is only possible over faces, not over corners
		// Mining is only possible, if standing:
		// 		-> CASE 1: x+1/x-1 or z+1/z-1 with y-2/y-1
		//					-> Check if walkable and coords reachable
		//					-> minable and reachable
		//		-> CASE 2: x+1/x-1 or z+1/z-1 with y		
		//					-> Check if voxel is walkable (+2 instead of nonSolid) and reachable
		//					-> minable and reachable
		//		-> CASE 3: x and z and y-3
		//					-> Check if walkable and coords reachable
		//					-> minable and reachable

		let walkableNeighborsToReachCurrentSelectedVoxel = [];
		yLoop: for(let y = -2; y <= 0; y++) {
			// Check additional condition of CASE 2
			if(y === 0) {
				let voxelWalkabilityOfSelectedVoxel = this._voxelWalkablilityData.getVoxelWalkability([this._selectedCoords[index][0], this._selectedCoords[index][1], this._selectedCoords[index][2]]);
				if(voxelWalkabilityOfSelectedVoxel === 0) {
					break yLoop;
				}
			}
			// Loops for CASE 1 and CASE 2
			let faceNeighbors = [{x: -1, z: 0}, {x: 0, z: -1}, {x: 1, z: 0}, {x: 0, z: 1}]
			for(let j = 0; j < faceNeighbors.length; j++) {
				let coordsNextToSelected = [
					this._selectedCoords[index][0] + faceNeighbors[j].x,
					this._selectedCoords[index][1] + y,
					this._selectedCoords[index][2] + faceNeighbors[j].z
				];

				if(this._voxelWalkablilityData.getVoxelWalkability(coordsNextToSelected) !== 0) {
					walkableNeighborsToReachCurrentSelectedVoxel.push(coordsNextToSelected);
				}
			}
		}

		// Check condition for CASE 3:
		let coordsTwoVoxelsBelowSelected = [this._selectedCoords[index][0], this._selectedCoords[index][1] - 3, this._selectedCoords[index][2]];
		if(this._voxelWalkablilityData.getVoxelWalkability(coordsTwoVoxelsBelowSelected) !== 0) {
			walkableNeighborsToReachCurrentSelectedVoxel.push(coordsTwoVoxelsBelowSelected);				
		}

		return walkableNeighborsToReachCurrentSelectedVoxel;
	}

	_updateRenderMesh() {
		if(this._meshIsAddedToScene === true) {
			this._scene.remove(this.selectedVoxelsMesh);
		} else {
			this._meshIsAddedToScene = true;
		}

		var selectedVoxelsMaterial = new THREE.MeshBasicMaterial( {color: "rgb(0, 255, 255)", transparent: true, opacity: 0.5} );

		let voxel = new Voxel(1.001);

		let selectedVoxelsVerticesBuffer = new ArrayBuffer(4 * 12 * this._selectedCoords.length * 6);
		this.selectedVoxelsVertices = new Float32Array(selectedVoxelsVerticesBuffer);
		let selectedVoxelsNormalsBuffer = new ArrayBuffer(4 * 12 * this._selectedCoords.length * 6);
		this.selectedVoxelsNormals = new Float32Array(selectedVoxelsNormalsBuffer);
		let selectedVoxelsIndexBuffer = new ArrayBuffer(4 * 6 * this._selectedCoords.length * 6);
		this.selectedVoxelsIndices = new Uint32Array(selectedVoxelsIndexBuffer);

		let indexCounter = 0;
		for(let i = 0; i < this._selectedCoords.length; i++) {
			voxel.setPosition(this._selectedCoords[i]);
			this.selectedVoxelsVertices.set(voxel.getGeometry(), i * 6 * 12);
			this.selectedVoxelsNormals.set(voxel.getNormals(), i * 6 * 12);
			let indices = voxel.getIndices();
			for(let j = 0; j < indices.length; j++) {
				indices[j] += indexCounter;
			}
			indexCounter += (indices.length / 6) * 4;
			this.selectedVoxelsIndices.set(new Float32Array(indices), i * 6 * 6);
		}

		var selectedVoxelsGeometry = new THREE.BufferGeometry();
		selectedVoxelsGeometry.addAttribute('position', new THREE.BufferAttribute(this.selectedVoxelsVertices,3));
		selectedVoxelsGeometry.addAttribute('normals', new THREE.BufferAttribute(this.selectedVoxelsNormals,3));
		selectedVoxelsGeometry.setIndex( new THREE.BufferAttribute(this.selectedVoxelsIndices,1));

		this.selectedVoxelsMesh = new THREE.Mesh(selectedVoxelsGeometry, selectedVoxelsMaterial);

		this._scene.add(this.selectedVoxelsMesh);
	}
}