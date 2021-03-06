// Initialize threejs-variables
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("myCanvas"),
										antialias: true} );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("rgb(150, 150, 175)");
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );

camera.position.x = 128;
camera.position.y = 96;
camera.position.z = 128;
controls.target.x = 128;
controls.target.y = 32;
controls.target.z = 128;

// Initialize variables for fps-stats
var stats;
var container = document.body;
stats = new Stats();
container.appendChild( stats.dom );

// Initialize lights
var ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.3);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight("rgb(255, 255, 255)", 0.8);
directionalLight.position.set( 1, 1.75, 1 );
directionalLight.position.multiplyScalar( 300 );
scene.add(directionalLight);

// Initialize worldManager
var worldManager = new WorldManager(scene, camera);
var worldSideLength = CHUNK_SIZE.x * NUMBER_OF_CHUNKS.x;
var chunkManagerInitialized = false;

// Add water-plane to scene
var waterPlaneMaterial = new THREE.MeshLambertMaterial( {color: "rgb(50,50,255)", side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
var waterPlaneGeometry = new THREE.PlaneGeometry( worldSideLength, worldSideLength, 1 );
var waterPlaneMesh = new THREE.Mesh( waterPlaneGeometry, waterPlaneMaterial );
waterPlaneMesh.position.x = 127.5;
waterPlaneMesh.position.y = 8;
waterPlaneMesh.position.z = 127.5;
waterPlaneMesh.rotation.x = THREE.Math.degToRad(90);
scene.add(waterPlaneMesh);

// Add sand-plane to scene
var sandPlaneMaterial = new THREE.MeshLambertMaterial( {color: "rgb(249,230,114)", side: THREE.DoubleSide} );
var sandPlaneGeometry = new THREE.PlaneGeometry( worldSideLength, worldSideLength, 1 );
var sandPlaneMesh = new THREE.Mesh( sandPlaneGeometry, sandPlaneMaterial );
sandPlaneMesh.position.x = 127.5;
sandPlaneMesh.position.y = 0.5;
sandPlaneMesh.position.z = 127.5;
sandPlaneMesh.rotation.x = THREE.Math.degToRad(90);
scene.add(sandPlaneMesh);

// Load the texture asynchronously
var chunkManagerTexture;
var textureIsLoading = true;
/*var textureLoader = new THREE.TextureLoader();
textureLoader.load('./res/cubes.png', function (texture){
	console.log('texture loaded');
	texture.flipY = false;
	textureIsLoading = false;
	chunkManagerTexture = texture;
}, undefined, function (err) {
	console.error('texture not loaded', err)
});*/
textureIsLoading = false;

// Initialize a dwarf
var dwarfManager = new DwarfManager(scene, worldManager);

// Main game loop
var main = function () {
	if(textureIsLoading === false && chunkManagerInitialized === false) {
		worldManager.initializeChunkManager(chunkManagerTexture, scene);
		chunkManagerInitialized = true;
	}

	if (chunkManagerInitialized === true) {
		stats.begin();

		controls.update();

		worldManager.update();

		dwarfManager.update();

		renderer.render(scene, camera);
		stats.end();
	}

	resetMouse();
	resetKeyboard();
	updateClock();
	requestAnimationFrame( main );
};

// Start game
main();