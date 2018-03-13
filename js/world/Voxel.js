class Voxel {

	constructor(voxelSideLength) {
		this._position = [0, 0, 0];
		this._texOffset = [0, 0];

		this._size = voxelSideLength / 2;
		this._texSize = 16 / 128;
		this._texDiff = 1 / 256;

		this._voxelIsVisible = true;
		this._faceIsVisibleArray = [true, true, true, true, true, true];

		this._indices = [
			[0, 1, 2, 0, 3, 1],
			[0, 1, 2, 1, 3, 2],
			[0, 1, 2, 1, 0, 3],
			[0, 1, 2, 0, 3, 1],
			[0, 1, 2, 0, 2, 3],
			[0, 1, 2, 0, 3, 1]
		];

		this._faceVertices = [
			[
				-this._size,-this._size,-this._size,	// -x face
				-this._size, this._size, this._size,
				-this._size, this._size,-this._size,
				-this._size,-this._size, this._size,
			],
			[
				 this._size, this._size, this._size,	// +z face
 				-this._size, this._size, this._size,
				 this._size,-this._size, this._size,
				-this._size,-this._size, this._size,
			],
			[
				 this._size, this._size, this._size, 	// +x face
				 this._size,-this._size,-this._size,
				 this._size, this._size,-this._size,
				 this._size,-this._size, this._size,
			],
			[
				 this._size, this._size,-this._size,	// -z face
				-this._size,-this._size,-this._size,
				-this._size, this._size,-this._size,
				 this._size,-this._size,-this._size,
			],
			[
				 this._size, this._size, this._size,	// +y face
				 this._size, this._size,-this._size,
				-this._size, this._size,-this._size,
				-this._size, this._size, this._size,
			],
			[
				 this._size,-this._size, this._size,	// -y face
				-this._size,-this._size,-this._size,
				 this._size,-this._size,-this._size,
				-this._size,-this._size, this._size,
			],
		];

		this._normals = [
			[-1, 0, 0],
			[ 0, 0, 1],
			[ 1, 0, 0],
			[ 0, 0,-1],
			[ 0, 1, 0],
			[ 0,-1, 0]
		];

		this._texCoords = [
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
		if(false === this._voxelIsVisible){
			return indices;
		}

		let indexCounter = 0;
		for(let i = 0; i < 6; i++) {
			if(this._faceIsVisibleArray[i]) {
				for(let j = 0; j < 6; j++) {
					indices.push(this._indices[i][j] + indexCounter);
				}
				indexCounter += 4;
			}
		}

		return indices;		
	}

	getGeometry() {
		let vertices = [];
		if(false === this._voxelIsVisible){
			return vertices;
		}

		for(let i = 0; i < 6; i++) {
			if(this._faceIsVisibleArray[i]) {
				for(let j = 0; j < 12; j++) {
					vertices.push(this._faceVertices[i][j] + this._position[j % 3]);
				}
			}
		}

		return vertices;
	}

	getNormals() {
		let normals = [];
		if(false === this._voxelIsVisible){
			return normals;
		}

		for(let i = 0; i < 6; i++) {
			if(this._faceIsVisibleArray[i]) {
				for(let j = 0; j < 4; j++) {
					normals = normals.concat(this._normals[i]);
				}
			}
		}

		return normals;		
	}

	getTexCoords() {
		let texCoords = [];
		if(false === this._voxelIsVisible){
			return texCoords;
		}

		for(let i = 0; i < 6; i++) {
			if(this._faceIsVisibleArray[i]) {
				for(let j = 0; j < 8; j++) {
					if(this._texCoords[i][j] == 0)
						texCoords.push(this._texSize * (this._texOffset[j % 2] + this._texCoords[i][j]) + this._texDiff);
					else
						texCoords.push(this._texSize * (this._texOffset[j % 2] + this._texCoords[i][j]) - this._texDiff);
				}
			}
		}
		
		return texCoords;
	}

	setPosition(position) {
		this._position = position;
	}

	setTexOffset(texOffset) {
		this._texOffset = texOffset;
	}

	setVisibility(visibility) {
		this._voxelIsVisible = visibility;
	}

	setFaceVisibility(faceIsVisibleArray) {
		this._faceIsVisibleArray = faceIsVisibleArray;
	}
}