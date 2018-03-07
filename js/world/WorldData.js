class WorldData {
	constructor(scene) {
		this.CUBE_TYPE_AIR = 254;
		this.CUBE_TYPE_WATER = 253;
		this.CUBE_TYPE_OUTSIDE_WORLD = 255;

		this.WATER_SURFACE_HEIGHT = 8;

		this.simplex = new SimplexNoise();

		this.chunkSize = {x: 16, y: 96, z: 16};
		this.numberOfChunks = {x: 16, z: 16};
		this.worldSize = {x: this.chunkSize.x * this.numberOfChunks.x,
						  y: this.chunkSize.y,
						  z: this.chunkSize.z * this.numberOfChunks.z};

		this.numberOfCubesPerChunk = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;
		this.numberOfCubes = this.numberOfCubesPerChunk * this.numberOfChunks.x * this.numberOfChunks.z;

		let cubeTypesBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeTypes = new Uint8Array(cubeTypesBuffer);
		this.initializeCubeTypes();

		let cubeWalkabilitiesBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeWalkabilities = new Uint8Array(cubeWalkabilitiesBuffer);
		this.initializeCubeWalkabilities();

		//this.scene = scene;
		//this.walkabilityPoints = {};
		//this.addWalkabilityToScene(scene);
	}

	initializeCubeTypes() {
		let cubeIndex = 0;
		for(let x = 0; x < this.worldSize.x; x++) {
			for(let z = 0; z < this.worldSize.z; z++) {
				let height = this.getHeightFromSimplex(x, z);
				for(let y = 0; y < this.worldSize.y; y++) {
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

	initializeCubeWalkabilities() {
		let cubeIndex = 0;
		for(let x = 0; x < this.worldSize.x; x++) {
			for(let z = 0; z < this.worldSize.z; z++) {
				for(let y = 0; y < this.worldSize.y; y++) {
					this.updateCubeWalkability([x, y, z]);
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

	updateWorldData(coords, type) {
		this.cubeTypes[this.getIndexFromCoordinates(coords)] = type;
		for(let y = -1; y <= 1; y++) {
			this.updateCubeWalkability([coords[0], coords[1] + y, coords[2]]);
		}

		//this.scene.remove(this.walkabilityPoints);
		//this.addWalkabilityToScene();
	}

	getCubeType(coords) {
		return this.cubeTypes[this.getIndexFromCoordinates(coords)];
	}

	getCubeWalkability(coords) {
		return this.cubeWalkabilities[this.getIndexFromCoordinates(coords)];
	}

	setCubeWalkability(coords, walkability) {
		// Function is used in pathfinder to temporarly set walkability to 0.
		this.cubeWalkabilities[this.getIndexFromCoordinates(coords)] = walkability;
	}

	updateCubeWalkability(coords) {
		let cubeIndex = this.getIndexFromCoordinates(coords);
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if(y === 0 || this.cubeTypes[cubeIndex] === this.CUBE_TYPE_WATER) {
			this.cubeWalkabilities[cubeIndex] = 0;
			return;
		}

		let cubeIsSolid = this.cubeTypes[this.getIndexFromCoordinates([x, y, z])] !== this.CUBE_TYPE_AIR &&
						  this.cubeTypes[this.getIndexFromCoordinates([x, y, z])] !== this.CUBE_TYPE_WATER;

		if(cubeIsSolid === true) {
			this.cubeWalkabilities[cubeIndex] = 0;
			return;
			console.log("return did not happen!");
		}

		let lowerCubeIsSolid = 	this.cubeTypes[this.getIndexFromCoordinates([x, y - 1, z])] !== this.CUBE_TYPE_AIR &&
								this.cubeTypes[this.getIndexFromCoordinates([x, y - 1, z])] !== this.CUBE_TYPE_WATER;

		if(lowerCubeIsSolid === true && y === this.worldSize.y - 1) {
			this.cubeWalkabilities[cubeIndex] = 1;		
		} else if(lowerCubeIsSolid === true) {
			let upperCubeIsNotSolid = 	this.cubeTypes[this.getIndexFromCoordinates([x, y + 1, z])] === this.CUBE_TYPE_AIR ||
										this.cubeTypes[this.getIndexFromCoordinates([x, y + 1, z])] === this.CUBE_TYPE_WATER;
			if(upperCubeIsNotSolid === true) {
				this.cubeWalkabilities[cubeIndex] = 1;					
			} else {
				this.cubeWalkabilities[cubeIndex] = 0;			
			}
		} else {
			this.cubeWalkabilities[cubeIndex] = 0;			
		}

	}

	getHeight(x, z) {
		for(let y = 0; y < this.chunkSize.y; y++) {
			if(this.getCubeType([x,y,z]) === this.CUBE_TYPE_AIR) {
				return y;
			}
		}
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

	/*
	addWalkabilityToScene(scene) {
		let walkabilityGeometry = new THREE.Geometry();

		for(let x = 0; x < this.worldSize.x; x++) {
			for(let z = 0; z < this.worldSize.z; z++) {
				for(let y = 0; y < this.worldSize.y; y++) {
					if(this.getCubeWalkability([x,y,z]) === 1) {
						let point = new THREE.Vector3();
						point.x = x;
						point.y = y;
						point.z = z;

						walkabilityGeometry.vertices.push( point );
					}
				}
			}
		}

		let walkabilityMaterial = new THREE.PointsMaterial( { color: "rgb(255, 0, 0)", size : 0.25 } );
		this.walkabilityPoints = new THREE.Points( walkabilityGeometry, walkabilityMaterial );

		this.scene.add( this.walkabilityPoints );
	}
	*/
}