class MousePicker {
	constructor(scene, camera, voxelTypesData) {
		this._camera = camera;
		this._voxelTypesData = voxelTypesData;

		this._raycaster = new THREE.Raycaster();

		this._indexOfCurrentLayer = WORLD_SIZE.y - 1;

		// Initialize voxel which shows the selected voxel
		var selectedVoxelGeometry = new THREE.BoxGeometry( 1.01, 1.01, 1.01 );
		var selectedVoxelMaterial = new THREE.MeshBasicMaterial( {color: "rgb(255, 255, 0)", transparent: true, opacity: 0.5} );
		this._selectedVoxelMesh = new THREE.Mesh( selectedVoxelGeometry, selectedVoxelMaterial );
		scene.add( this._selectedVoxelMesh );
	}

	// Public methods:

	update() {
		this._raycaster.setFromCamera( mouse.position, this._camera );

		if(keyboard.fTipped && this._indexOfCurrentLayer > 0) {
			this._indexOfCurrentLayer--;
		} else if(keyboard.rTipped && this._indexOfCurrentLayer < WORLD_SIZE.y - 1) {
			this._indexOfCurrentLayer++;
		}


		this.selectedVoxelCoords = this._getIntersectionWithMouseRay(this._raycaster.ray);

		if(this.selectedVoxelCoords !== undefined) {
			this._selectedVoxelMesh.position.x = this.selectedVoxelCoords[0];
			this._selectedVoxelMesh.position.y = this.selectedVoxelCoords[1];
			this._selectedVoxelMesh.position.z = this.selectedVoxelCoords[2];
		}
	}

	getIndexOfCurrentLayer() {
		return this._indexOfCurrentLayer;
	}

	getSelectedVoxelCoords() {
		return this.selectedVoxelCoords;
	}

	// Private methods:

	_getIntersectionWithMouseRay(ray) {
		let mouseRay = [ray.direction.x, ray.direction.y, ray.direction.z];
		let cameraPosition = [ray.origin.x, ray.origin.y, ray.origin.z];

		// Calculate cameraCoords
		let cameraCoords = [0,0,0];
		cameraCoords[0] = Math.floor((cameraPosition[0] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
		cameraCoords[1] = Math.floor((cameraPosition[1] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
		cameraCoords[2] = Math.floor((cameraPosition[2] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);

		// Get nearest x, y, z planes:
		let nearest = new Array(3);
		nearest[0] = cameraCoords[0] + Math.sign(mouseRay[0]) * VOXEL_HALF_SIDE_LENGTH;
		nearest[1] = cameraCoords[1] + Math.sign(mouseRay[1]) * VOXEL_HALF_SIDE_LENGTH;
		nearest[2] = cameraCoords[2] + Math.sign(mouseRay[2]) * VOXEL_HALF_SIDE_LENGTH;

		// Get lambdas from ray-plane intersection:
		let HIGH_LAMBDA_VALUE = 10000;
		let lambda = [HIGH_LAMBDA_VALUE, HIGH_LAMBDA_VALUE, HIGH_LAMBDA_VALUE];
		let lambdaMinValue = lambda[0];
		let lambdaMinIndex = 0;
		if(Math.abs(mouseRay[0]) > 0.00001) {
			lambda[0] = (nearest[0] - cameraPosition[0]) / mouseRay[0];
			if(lambdaMinValue > lambda[0]) {
				lambdaMinValue = lambda[0];
				lambdaMinIndex = 0;
			}
		}
		if(Math.abs(mouseRay[1]) > 0.00001) {
			lambda[1] = (nearest[1] - cameraPosition[1]) / mouseRay[1];
			if(lambdaMinValue > lambda[1]) {
				lambdaMinValue = lambda[1];
				lambdaMinIndex = 1;

			}
		}
		if(Math.abs(mouseRay[2]) > 0.00001) {
			lambda[2] = (nearest[2] - cameraPosition[2]) / mouseRay[2];
			if(lambdaMinValue > lambda[2]) {
				lambdaMinValue = lambda[2];
				lambdaMinIndex = 2;
			}
		}

		// Get selectedVoxelCoordinates and selectedVoxelType
		let selectedVoxelCoordinates = [0,0,0];
		let selectedVoxelType = VOXEL_TYPE.AIR;

		while(lambdaMinValue < MAXIMUM_PICKING_RANGE) {
			// Calculate the coordinates of the voxel, with which the current ray intersects
			selectedVoxelCoordinates[lambdaMinIndex] = (nearest[lambdaMinIndex] + Math.sign(mouseRay[lambdaMinIndex]) * VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH;
			//console.log(selectedVoxelCoordinates[lambdaMinIndex]);
			if(lambdaMinIndex === 0) {
				selectedVoxelCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
				selectedVoxelCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
			} else if(lambdaMinIndex === 1) {
				selectedVoxelCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
				selectedVoxelCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
			} else if(lambdaMinIndex === 2) {
				selectedVoxelCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
				selectedVoxelCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + VOXEL_HALF_SIDE_LENGTH) / VOXEL_SIDE_LENGTH);
			}

			// Check if coordinates are inside [min, max] interval, if not set air type
			if(	selectedVoxelCoordinates[0] >= 0 && selectedVoxelCoordinates[0] < WORLD_SIZE.x &&	// <=
				selectedVoxelCoordinates[1] >= 0 && selectedVoxelCoordinates[1] <= this._indexOfCurrentLayer &&	// or
				selectedVoxelCoordinates[2] >= 0 && selectedVoxelCoordinates[2] < WORLD_SIZE.z) {	// < ?? 
				selectedVoxelType = this._voxelTypesData.getVoxelType(selectedVoxelCoordinates);
			} else {
				selectedVoxelType = VOXEL_TYPE.AIR;
			}

			// Reset lambdaMinValue to high value for next iteration or exiting while-loop
			lambdaMinValue = HIGH_LAMBDA_VALUE;

			// If selectedVoxelType is air, go one plane further away from camera of current
			// lambdaMinIndex plane and find new lambdaMinValue and lambdaMinIndex
			if(selectedVoxelType === VOXEL_TYPE.AIR) {
				nearest[lambdaMinIndex] += Math.sign(mouseRay[lambdaMinIndex]);
				lambda[lambdaMinIndex] = (nearest[lambdaMinIndex] - cameraPosition[lambdaMinIndex]) / mouseRay[lambdaMinIndex];

				// Get lowest lambda
				for(let i = 0; i < 3; i++) {
					if(lambdaMinValue > lambda[i]) {
						lambdaMinValue = lambda[i];
						lambdaMinIndex = i;
					}
				}
			}
		}

		// Check if coordinates are inside [min, max] interval, if not set air type
		if(	selectedVoxelType != VOXEL_TYPE.AIR) {
			return selectedVoxelCoordinates;
		} else {
			return undefined;
		}
	}
}