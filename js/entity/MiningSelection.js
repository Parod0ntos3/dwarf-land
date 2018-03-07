class MiningSelection{
	constructor(scene) {
		this.selectedCoords = [];
		this.meshIsAddedToScene = false;
		this.scene = scene;
	}

	update(mousePicker) {
		if(keyboard.sTipped && mousePicker.getSelectedCubeCoords() !== undefined) {
			let index = this.getIndexOfCoordsInSelectedCoordsArray(mousePicker.getSelectedCubeCoords());
			if(index === undefined) {
				this.selectedCoords.push(mousePicker.getSelectedCubeCoords());
				this.updateRenderMesh();
			}
		} 
	}

	getSelectedCoords() {
		return this.selectedCoords;
	}

	removeFromSelection(coords) {
		let index = this.getIndexOfCoordsInSelectedCoordsArray(coords);
		if(index !== undefined) {
				this.selectedCoords.splice(index, 1);
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