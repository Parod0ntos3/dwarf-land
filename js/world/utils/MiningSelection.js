class MiningSelection{
	constructor(scene, worldData) {
		this.selectedCoords = [];
		this.walkableCoordsToReachSelectedCoords = [];
		this.meshIsAddedToScene = false;
		this.scene = scene;
		this.worldData = worldData;
	}

	update(mousePicker) {
		if(keyboard.sTipped && mousePicker.getSelectedCubeCoords() !== undefined) {
			let index = this.getIndexOfCoordsInSelectedCoordsArray(mousePicker.getSelectedCubeCoords());
			if(index === undefined) {
				this.selectedCoords.push(mousePicker.getSelectedCubeCoords());
				this.updateWalkableCoordsToReachSelectedCoords();
				this.updateRenderMesh();
			}
		} 
	}

	getSelectedCoords() {
		return this.selectedCoords;
	}

	getWalkableCoordsToReachSelectedCoords() {
		return this.walkableCoordsToReachSelectedCoords;
	}

	removeCoordsFromSelection(coords) {
		let index = this.getIndexOfCoordsInSelectedCoordsArray(coords);
		if(index !== undefined) {
				this.selectedCoords.splice(index, 1);
				this.updateWalkableCoordsToReachSelectedCoords();
				this.updateRenderMesh();
		}		
	}

	getIndexOfCoordsInSelectedCoordsArray(coords) {
		for(let i = 0; i < this.selectedCoords.length; i++) {
			if(coords[0] === this.selectedCoords[i][0] && 
			   coords[1] === this.selectedCoords[i][1] && 
			   coords[2] === this.selectedCoords[i][2]) {
				return i;
			}
		}
		return undefined;
	}

	updateWalkableCoordsToReachSelectedCoords() {
		this.walkableCoordsToReachSelectedCoords = [];
		iLoop: for(let i = 0; i < this.selectedCoords.length; i++) {
			// Check if all (face-) neighbors are solid, if so, selectedCoords[i] is not reachable
			let neighborsTypes = this.worldData.getNeighborsTypes(this.selectedCoords[i]);
			let allNeighborsAreSolid = true;
			for(let j = 0; j < 6; j++) {
				// Check if neighbor cube is solid
				if( neighborsTypes[j] !== this.worldData.CUBE_TYPE_AIR && 
					neighborsTypes[j] !== this.worldData.CUBE_TYPE_WATER) {
				} else {
				   	allNeighborsAreSolid = false;
				}
			}

			if(allNeighborsAreSolid === true) {
				this.walkableCoordsToReachSelectedCoords.push([]);
				continue iLoop;
			}

			// Convention: mining is only possible over faces, not over corners
			// Mining is only possible, if standing:
			// 		-> CASE 1: x+1/x-1 or z+1/z-1 with y-1/y
			//					-> Check if walkable and coords reachable
			//					-> minable and reachable
			//		-> CASE 2: x+1/x-1 or z+1/z-1 with y+1		
			//					-> Check if cube above is walkable (+2 instead of nonSolid) and coords walkable and reachable
			//					-> minable and reachable
			//		-> CASE 3: x and z and y-2
			//					-> Check if walkable and coords reachable
			//					-> minable and reachable

			let walkableNeighborsToReachCurrentSelectedCube = [];
			yLoop: for(let y = -1; y <= 1; y++) {
				// Check additional condition of CASE 2
				if(y === 1) {
					let cubeWalkabilityOfCubeAboveSelected = this.worldData.getCubeWalkability([this.selectedCoords[i][0], this.selectedCoords[i][1] + y, this.selectedCoords[i][2]]);
					if(cubeWalkabilityOfCubeAboveSelected === 0) {
						break yLoop;
					}
				}
				// Loops for CASE 1 and CASE 2
				let faceNeighbors = [{x: -1, z: 0}, {x: 0, z: -1}, {x: 1, z: 0}, {x: 0, z: 1}]
				for(let j = 0; j < faceNeighbors.length; j++) {
					let coordsNextToSelected = [
						this.selectedCoords[i][0] + faceNeighbors[j].x,
						this.selectedCoords[i][1] + y,
						this.selectedCoords[i][2] + faceNeighbors[j].z
					];

					if(this.worldData.getCubeWalkability(coordsNextToSelected) !== 0) {
						walkableNeighborsToReachCurrentSelectedCube.push(coordsNextToSelected);
					}
				}
			}

			// Check condition for CASE 3:
			let coordsTwoVoxelsBelowSelected = [this.selectedCoords[i][0], this.selectedCoords[i][1] - 2, this.selectedCoords[i][2]];
			if(this.worldData.getCubeWalkability(coordsTwoVoxelsBelowSelected) !== 0) {
				walkableNeighborsToReachCurrentSelectedCube.push(coordsTwoVoxelsBelowSelected);				
			}

			this.walkableCoordsToReachSelectedCoords.push(walkableNeighborsToReachCurrentSelectedCube);
		}
	}

	updateRenderMesh() {
		if(this.meshIsAddedToScene === true) {
			this.scene.remove(this.selectedCubesMesh);
		} else {
			this.meshIsAddedToScene = true;
		}

		var selectedCubesMaterial = new THREE.MeshBasicMaterial( {color: "rgb(0, 255, 255)", transparent: true, opacity: 0.5} );

		let cube = new Cube(1.001);

		let selectedCubesVerticesBuffer = new ArrayBuffer(4 * 12 * this.selectedCoords.length * 6);
		this.selectedCubesVertices = new Float32Array(selectedCubesVerticesBuffer);
		let selectedCubesNormalsBuffer = new ArrayBuffer(4 * 12 * this.selectedCoords.length * 6);
		this.selectedCubesNormals = new Float32Array(selectedCubesNormalsBuffer);
		let selectedCubesIndexBuffer = new ArrayBuffer(4 * 6 * this.selectedCoords.length * 6);
		this.selectedCubesIndices = new Uint32Array(selectedCubesIndexBuffer);

		let indexCounter = 0;
		for(let i = 0; i < this.selectedCoords.length; i++) {
			cube.setPosition(this.selectedCoords[i]);
			this.selectedCubesVertices.set(cube.getGeometry(), i * 6 * 12);
			this.selectedCubesNormals.set(cube.getNormals(), i * 6 * 12);
			let indices = cube.getIndices();
			for(let j = 0; j < indices.length; j++) {
				indices[j] += indexCounter;
			}
			indexCounter += (indices.length / 6) * 4;
			this.selectedCubesIndices.set(new Float32Array(indices), i * 6 * 6);
		}

		var selectedCubesGeometry = new THREE.BufferGeometry();
		selectedCubesGeometry.addAttribute('position', new THREE.BufferAttribute(this.selectedCubesVertices,3));
		selectedCubesGeometry.addAttribute('normals', new THREE.BufferAttribute(this.selectedCubesNormals,3));
		selectedCubesGeometry.setIndex( new THREE.BufferAttribute(this.selectedCubesIndices,1));

		this.selectedCubesMesh = new THREE.Mesh(selectedCubesGeometry, selectedCubesMaterial);

		this.scene.add(this.selectedCubesMesh);
	}
}