class WorldData {
	constructor() {
		this.CUBE_TYPE_AIR = 254;
		this.CUBE_TYPE_WATER = this.CUBE_TYPE_AIR;
		this.CUBE_TYPE_OUTSIDE_WORLD = 255;

		this.WATER_SURFACE_HEIGHT = 8;

		this.simplex = new SimplexNoise();


		this.chunkSize = {x: 16, y: 96, z: 16};
		this.numberOfChunks = {x: 16, z: 16};
		this.worldSize = {x: this.chunkSize.x * this.numberOfChunks.x,
						  y: this.chunkSize.y,
						  z: this.chunkSize.z * this.numberOfChunks.z};
		this.cubeTypes = [];

		this.numberOfCubesPerChunk = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;
		this.numberOfCubes = this.numberOfCubesPerChunk * this.numberOfChunks.x * this.numberOfChunks.z;

		let cubeTypeBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeTypes = new Uint8Array(cubeTypeBuffer);
		this.initializeCubeTypes();
	}

	initializeCubeTypes() {
		let cubeIndex = 0;
		for(let x = 0; x < this.chunkSize.x * this.numberOfChunks.x; x++) {
			for(let z = 0; z < this.chunkSize.z * this.numberOfChunks.z; z++) {
				let height = this.getHeightFromSimplex(x, z);
				for(let y = 0; y < this.chunkSize.y; y++) {
					if(y <= height - 2) {
						this.cubeTypes[cubeIndex] = 0;
					} else if(y <= height && y <= this.getSandHeightFromSimplex(x, z)) {
						this.cubeTypes[cubeIndex] = 2;
					} else if(y <= height && y > this.WATER_SURFACE_HEIGHT) {
						this.cubeTypes[cubeIndex] = 1;
					} else if(y > height && y <= this.WATER_SURFACE_HEIGHT) {
						this.cubeTypes[cubeIndex] = this.CUBE_TYPE_WATER;						
					} else {
						this.cubeTypes[cubeIndex] = this.CUBE_TYPE_AIR;
					}
					cubeIndex++;
				}
			}
		}
	}

	getHeightFromSimplex(x, z) {
		let maxDistance = (this.chunkSize.x * this.numberOfChunks.x * 0.5 * Math.sqrt(2));
		let x_dist = x - (this.chunkSize.x * this.numberOfChunks.x) / 2;
		let z_dist = z - (this.chunkSize.z * this.numberOfChunks.z) / 2;

		let distanceFromCenter = Math.sqrt(x_dist * x_dist + z_dist * z_dist);
		if(distanceFromCenter === 0)
			distanceFromCenter = 1;

		// Height in interval [0; 48]
		let heightFromDistanceFromCenter = -16;
		
		if (distanceFromCenter <= 128)
			heightFromDistanceFromCenter = (143021 * Math.pow(distanceFromCenter, 3))/2246553600
			 - (8545943 * Math.pow(distanceFromCenter, 2))/748851200
			 - (5229361 * distanceFromCenter)/70204800
			 + 48;

		let noise = 0;
		for(let i = 4; i <= 8; i++) {
			let waveLength = i * 8;
			noise += this.simplex.noise(x / waveLength, z / waveLength);
		}
		// Scale noise from [-1; 1]*4 to [0; 20]*4
		noise += 1;
		noise *= 10;

		// Add noise to heightFromDistanceFromCenter
		let height = heightFromDistanceFromCenter + noise;

		if(height < 0)
			height = 0;

		return height;
	}

	getSandHeightFromSimplex(x, z) {
		let noise = 0;
		for(let i = 5; i <= 8; i++) {
			let waveLength = i * 6;
			noise += this.simplex.noise(x / waveLength, z / waveLength);
		}
		// Scale noise
		noise += 1;
		noise *= 3;
		noise += this.WATER_SURFACE_HEIGHT;

		return noise;
	}

	getCubeType(coords) {
		return this.cubeTypes[this.getIndexFromCoordinates(coords)];
	}

	getNeighborsTypes(coords) {
		let neighborsTypes = [];
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if( x >= 0 && x < this.worldSize.x && 
			y >= 1 && y < this.worldSize.y &&	// Layer y = 0 should not be rendered -> Plane instead of cubes!
			z >= 0 && z < this.worldSize.z) {

			if(x - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x - 1, y, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(z + 1 < this.worldSize.z)
				neighborsTypes.push(this.getCubeType([x, y, z + 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(x + 1 < this.worldSize.x)
				neighborsTypes.push(this.getCubeType([x + 1, y, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

			if(z - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y, z - 1]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);
 
			if(y + 1 < this.worldSize.y)
				neighborsTypes.push(this.getCubeType([x, y + 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.getCubeType([x, y - 1, z]));
			else
				neighborsTypes.push(this.CUBE_TYPE_OUTSIDE_WORLD);

		}

		return neighborsTypes;
	}	

	getIndexFromCoordinates(coords) {
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		let index = x * (this.worldSize.z * this.worldSize.y) + z * this.worldSize.y + y;
		return index;
	}

	getIntersectionWithMouseRay(ray) {
		let MAXIMUM_PICKING_RANGE = 20;

		let mouseRay = [ray.direction.x, ray.direction.y, ray.direction.z];
		let cameraPosition = [ray.origin.x, ray.origin.y, ray.origin.z];

		// Calculate cameraCoords
		this.cubeSideLength = 1;
		let halfCubeSideLength = this.cubeSideLength / 2;
		let cameraCoords = new Array(3);
		cameraCoords[0] = Math.floor((cameraPosition[0] + halfCubeSideLength) / this.cubeSideLength);
		cameraCoords[1] = Math.floor((cameraPosition[1] + halfCubeSideLength) / this.cubeSideLength);
		cameraCoords[2] = Math.floor((cameraPosition[2] + halfCubeSideLength) / this.cubeSideLength);

		// Get nearest x, y, z planes:
		let nearest = new Array(3);
		nearest[0] = cameraCoords[0] + Math.sign(mouseRay[0]) * halfCubeSideLength;
		nearest[1] = cameraCoords[1] + Math.sign(mouseRay[1]) * halfCubeSideLength;
		nearest[2] = cameraCoords[2] + Math.sign(mouseRay[2]) * halfCubeSideLength;

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
		let selectedCubeCoordinates = new Array(3);
		let selectedCubeType = this.CUBE_TYPE_AIR;

		while(lambdaMinValue < MAXIMUM_PICKING_RANGE) {
			// Calculate the coordinates of the cube, with which the current ray intersects
			selectedCubeCoordinates[lambdaMinIndex] = (nearest[lambdaMinIndex] + Math.sign(mouseRay[lambdaMinIndex]) * halfCubeSideLength) / this.cubeSideLength;
			//console.log(selectedCubeCoordinates[lambdaMinIndex]);
			if(lambdaMinIndex === 0) {
				selectedCubeCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + halfCubeSideLength) / this.cubeSideLength);
				selectedCubeCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + halfCubeSideLength) / this.cubeSideLength);
			} else if(lambdaMinIndex === 1) {
				selectedCubeCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + halfCubeSideLength) / this.cubeSideLength);
				selectedCubeCoordinates[2] = Math.floor((cameraPosition[2] + lambdaMinValue * mouseRay[2] + halfCubeSideLength) / this.cubeSideLength);
			} else if(lambdaMinIndex === 2) {
				selectedCubeCoordinates[0] = Math.floor((cameraPosition[0] + lambdaMinValue * mouseRay[0] + halfCubeSideLength) / this.cubeSideLength);
				selectedCubeCoordinates[1] = Math.floor((cameraPosition[1] + lambdaMinValue * mouseRay[1] + halfCubeSideLength) / this.cubeSideLength);
			}

			// Check if coordinates are inside [min, max] interval, if not set air type
			if(	selectedCubeCoordinates[0] >= 0 && selectedCubeCoordinates[0] < this.worldSize.x &&
				selectedCubeCoordinates[1] >= 0 && selectedCubeCoordinates[1] < this.worldSize.y &&
				selectedCubeCoordinates[2] >= 0 && selectedCubeCoordinates[2] < this.worldSize.z) {
				selectedCubeType = this.getCubeType(selectedCubeCoordinates);
			} else {
				selectedCubeType = this.CUBE_TYPE_AIR;
			}

			// Reset lambdaMinValue to high value for next iteration or exiting while-loop
			lambdaMinValue = HIGH_LAMBDA_VALUE;

			// If selectedCubeType is air, go one plane further away from camera of current
			// lambdaMinIndex plane and find new lambdaMinValue and lambdaMinIndex
			if(selectedCubeType === this.CUBE_TYPE_AIR) {
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

		return selectedCubeCoordinates;
	}
}