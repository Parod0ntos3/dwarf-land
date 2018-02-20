class WorldData {
	constructor() {

		this.CUBE_TYPE_AIR = 255;

		this.size = {x: 25, y: 25, z: 25};
		this.numberOfCubes = this.size.x * this.size.y * this.size.z;

		let cubeTypeBuffer = new ArrayBuffer(this.numberOfCubes);
		this.cubeTypes = new Uint8Array(cubeTypeBuffer);
		this.initializeCubeTypes();
	}

	initializeCubeTypes() {
		let cubeIndex = 0;
		for(let x = 0; x < this.size.x; x++) {
			for(let y = 0; y < this.size.y; y++) {
				for(let z = 0; z < this.size.z; z++) {
					this.cubeTypes[cubeIndex] = Math.floor(Math.random() * 5) - 1;
					cubeIndex++;					
				}
			}
		}
	}

	getNeighborsTypes(coords) {
		let neighborsTypes = [];
		let x = coords[0];
		let y = coords[1];
		let z = coords[2];

		if( x >= 0 && x <= this.size.x && 
			y >= 0 && y <= this.size.y &&
			z >= 0 && z <= this.size.z) {

			if(x - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x - 1, y, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z + 1 < this.size.z)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y, z + 1])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(x + 1 < this.size.x)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x + 1, y, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(z - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y, z - 1])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);
 
			if(y + 1 < this.size.y)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y + 1, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

			if(y - 1 >= 0)
				neighborsTypes.push(this.cubeTypes[this.getIndexFromCoordinates([x, y - 1, z])]);
			else
				neighborsTypes.push(this.CUBE_TYPE_AIR);

		}

		return neighborsTypes;
	}

	getIndexFromCoordinates(coords) {
		return coords[0] * (this.size.y * this.size.z) + coords[1] * this.size.z + coords[2];
	}
}