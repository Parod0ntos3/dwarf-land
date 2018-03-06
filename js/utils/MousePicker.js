class MousePicker {
	constructor(scene, camera, worldData) {
		this.worldData = worldData;
		this.camera = camera;

		this.raycaster = new THREE.Raycaster();
		this.MAXIMUM_PICKING_RANGE = 25;
		this.CUBE_SIDE_LENGTH = 1;
		this.CUBE_HALF_SIDE_LENGTH = this.CUBE_SIDE_LENGTH / 2;

		this.indexOfCurrentLayer = 40;

		// Initialize cube which shows the selected cube
		var selechtedCubeGeometry = new THREE.BoxGeometry( 1.01, 1.01, 1.01 );
		var selechtedCubeMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		this.selectedCubeMesh = new THREE.Mesh( selechtedCubeGeometry, selechtedCubeMaterial );
		scene.add( this.selectedCubeMesh );
	}

	update() {
		this.raycaster.setFromCamera( mouse.position, this.camera );

		if(keyboard.fTipped && this.indexOfCurrentLayer > 0) {
			this.indexOfCurrentLayer--;
		} else if(keyboard.rTipped && this.indexOfCurrentLayer < this.worldData.worldSize.y - 1) {
			this.indexOfCurrentLayer++;
		}


		this.selectedCubeCoords = this.getIntersectionWithMouseRay(this.raycaster.ray);

		if(this.selectedCubeCoords != null) {
			this.selectedCubeMesh.position.x = this.selectedCubeCoords[0];
			this.selectedCubeMesh.position.y = this.selectedCubeCoords[1];
			this.selectedCubeMesh.position.z = this.selectedCubeCoords[2];

			if(mouse.leftClicked === true)
				console.log(this.selectedCubeCoords);
		}
	}

	getIndexOfCurrentLayer() {
		return this.indexOfCurrentLayer;
	}

	getIntersectionWithMouseRay(ray) {
		let mouseRay = [ray.direction.x, ray.direction.y, ray.direction.z];
		let cameraPosition = [ray.origin.x, ray.origin.y, ray.origin.z];

		// Calculate cameraCoords
		let cameraCoords = [0,0,0];
		cameraCoords[0] = Math.floor((cameraPosition[0] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
		cameraCoords[1] = Math.floor((cameraPosition[1] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
		cameraCoords[2] = Math.floor((cameraPosition[2] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);

		// Get nearest x, y, z planes:
		let nearest = new Array(3);
		nearest[0] = cameraCoords[0] + Math.sign(mouseRay[0]) * this.CUBE_HALF_SIDE_LENGTH;
		nearest[1] = cameraCoords[1] + Math.sign(mouseRay[1]) * this.CUBE_HALF_SIDE_LENGTH;
		nearest[2] = cameraCoords[2] + Math.sign(mouseRay[2]) * this.CUBE_HALF_SIDE_LENGTH;

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

		// Get selectedCubeCoordinates and selectedCubeType
		let selectedCubeCoordinates = [0,0,0];
		let selectedCubeType = this.worldData.CUBE_TYPE_AIR;

		while(lambdaMinValue < this.MAXIMUM_PICKING_RANGE) {
			// Calculate the coordinates of the cube, with which the current ray intersects
			selectedCubeCoordinates[lambdaMinIndex] = (nearest[lambdaMinIndex] + Math.sign(mouseRay[lambdaMinIndex]) * this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH;
			//console.log(selectedCubeCoordinates[lambdaMinIndex]);
			if(lambdaMinIndex === 0) {
				selectedCubeCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
				selectedCubeCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
			} else if(lambdaMinIndex === 1) {
				selectedCubeCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
				selectedCubeCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
			} else if(lambdaMinIndex === 2) {
				selectedCubeCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
				selectedCubeCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + this.CUBE_HALF_SIDE_LENGTH) / this.CUBE_SIDE_LENGTH);
			}

			// Check if coordinates are inside [min, max] interval, if not set air type
			if(	selectedCubeCoordinates[0] >= 0 && selectedCubeCoordinates[0] < this.worldData.worldSize.x &&	// <=
				selectedCubeCoordinates[1] >= 0 && selectedCubeCoordinates[1] <= this.indexOfCurrentLayer &&	// or
				selectedCubeCoordinates[2] >= 0 && selectedCubeCoordinates[2] < this.worldData.worldSize.z) {	// < ?? 
				selectedCubeType = this.worldData.getCubeType(selectedCubeCoordinates);
			} else {
				selectedCubeType = this.worldData.CUBE_TYPE_AIR;
			}

			// Reset lambdaMinValue to high value for next iteration or exiting while-loop
			lambdaMinValue = HIGH_LAMBDA_VALUE;

			// If selectedCubeType is air, go one plane further away from camera of current
			// lambdaMinIndex plane and find new lambdaMinValue and lambdaMinIndex
			if(selectedCubeType === this.worldData.CUBE_TYPE_AIR) {
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
		if(	selectedCubeType != this.worldData.CUBE_TYPE_AIR) {
			return selectedCubeCoordinates;
		} else {
			return null;
		}
	}

	getSelectedCubeCoords() {
		return this.selectedCubeCoords;
	}
}