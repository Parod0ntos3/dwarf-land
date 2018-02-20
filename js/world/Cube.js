class Cube {

	constructor(cubeSideLength) {
		this.position = [0, 0, 0];
		this.texOffset = [0, 0];

		this.size = cubeSideLength / 2;
		this.texSize = 16 / 128;
		this.texDiff = 1 / 256;

		this.cubeIsVisible = true;
		this.faceIsVisibleArray = [true, true, true, true, true, true];

		this.indices = [
			[0, 1, 2, 0, 3, 1],
			[0, 1, 2, 1, 3, 2],
			[0, 1, 2, 1, 0, 3],
			[0, 1, 2, 0, 3, 1],
			[0, 1, 2, 0, 2, 3],
			[0, 1, 2, 0, 3, 1]
		];

		this.faceVertices = [
			[
				-this.size,-this.size,-this.size,	// -x face
				-this.size, this.size, this.size,
				-this.size, this.size,-this.size,
				-this.size,-this.size, this.size,
			],
			[
				 this.size, this.size, this.size,	// +z face
 				-this.size, this.size, this.size,
				 this.size,-this.size, this.size,
				-this.size,-this.size, this.size,
			],
			[
				 this.size, this.size, this.size, 	// +x face
				 this.size,-this.size,-this.size,
				 this.size, this.size,-this.size,
				 this.size,-this.size, this.size,
			],
			[
				 this.size, this.size,-this.size,	// -z face
				-this.size,-this.size,-this.size,
				-this.size, this.size,-this.size,
				 this.size,-this.size,-this.size,
			],
			[
				 this.size, this.size, this.size,	// +y face
				 this.size, this.size,-this.size,
				-this.size, this.size,-this.size,
				-this.size, this.size, this.size,
			],
			[
				 this.size,-this.size, this.size,	// -y face
				-this.size,-this.size,-this.size,
				 this.size,-this.size,-this.size,
				-this.size,-this.size, this.size,
			],
		];

		this.normals = [
			[-1, 0, 0],
			[ 0, 0, 1],
			[ 1, 0, 0],
			[ 0, 0,-1],
			[ 0, 1, 0],
			[ 0,-1, 0]
		];

		this.texCoords = [
			[
				0, 1,
				1, 0,
				0, 0,
				1, 1,
			],
			[
				1, 0,
				0, 0,
				1, 1,
				0, 1
			],
			[
				0, 0,
				1, 1,
				1, 0,
				0, 1
			],
			[
				0, 0,
				1, 1,
				1, 0,
				0, 1
			],
			[
				1, 1,
				1, 0,
				0, 0,
				0, 1
			],
			[
				1, 1,
				0, 0,
				1, 0,
				0, 1
			],
		];
	}

	getIndices() {
		let indices = [];
		if(false === this.cubeIsVisible){
			return indices;
		}

		let indexCounter = 0;
		for(let i = 0; i < 6; i++) {
			if(this.faceIsVisibleArray[i]) {
				for(let j = 0; j < 6; j++) {
					indices.push(this.indices[i][j] + indexCounter);
				}
				indexCounter += 4;
			}
		}

		return indices;		
	}

	getGeometry() {
		let vertices = [];
		if(false === this.cubeIsVisible){
			return vertices;
		}

		for(let i = 0; i < 6; i++) {
			if(this.faceIsVisibleArray[i]) {
				for(let j = 0; j < 12; j++) {
					vertices.push(this.faceVertices[i][j] + this.position[j % 3]);
				}
			}
		}

		return vertices;
	}

	getNormals() {
		let normals = [];
		if(false === this.cubeIsVisible){
			return normals;
		}

		for(let i = 0; i < 6; i++) {
			if(this.faceIsVisibleArray[i]) {
				for(let j = 0; j < 4; j++) {
					normals = normals.concat(this.normals[i]);
				}
			}
		}

		return normals;		
	}

	getTexCoords() {
		let texCoords = [];
		if(false === this.cubeIsVisible){
			return texCoords;
		}

		for(let i = 0; i < 6; i++) {
			if(this.faceIsVisibleArray[i]) {
				for(let j = 0; j < 8; j++) {
					if(this.texCoords[i][j] == 0)
						texCoords.push(this.texSize * (this.texOffset[j % 2] + this.texCoords[i][j]) + this.texDiff);
					else
						texCoords.push(this.texSize * (this.texOffset[j % 2] + this.texCoords[i][j]) - this.texDiff);
				}
			}
		}
		
		return texCoords;
	}

	setPosition(position) {
		this.position = position;
	}

	setTexOffset(texOffset) {
		this.texOffset = texOffset;
	}

	setVisibility(visibility) {
		this.cubeIsVisible = visibility;
	}

	setFaceVisibility(faceIsVisibleArray) {
		this.faceIsVisibleArray = faceIsVisibleArray;
	}
}