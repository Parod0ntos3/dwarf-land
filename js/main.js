var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("myCanvas"),
										antialias: true} );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("rgb(150, 150, 175)");
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var stats;
var container = document.body;
stats = new Stats();
container.appendChild( stats.dom );

var ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.3);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight("rgb(255, 255, 255)", 0.8);
directionalLight.position.set( 1, 1.75, 1 );
directionalLight.position.multiplyScalar( 30 );
scene.add(directionalLight);

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
controls.target.x = 128;
controls.target.y = 32;
controls.target.z = 128;

var geometry = new THREE.BoxGeometry( 1.01, 1.01, 1.01 );
var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var animate = function () {
	if(textureLoaded === true) {
		chunkManager = new ChunkManager(chunkManagerTexture, scene, worldData);
		chunkManagerInitialized = true;
		textureLoaded = false;
	}

	if (chunkManagerInitialized === true) {
		stats.begin();

		controls.update();
		raycaster.setFromCamera( mouse, camera );
		
		let mouseIntersectionCoords = worldData.getIntersectionWithMouseRay(raycaster.ray);

		cube.position.x = mouseIntersectionCoords[0];
		cube.position.y = mouseIntersectionCoords[1];
		cube.position.z = mouseIntersectionCoords[2];

		renderer.render(scene, camera);
		stats.end();
	}

	requestAnimationFrame( animate );
};

var worldData = new WorldData();

var worldSideLength = worldData.chunkSize.x * worldData.numberOfChunks.x;

// Add water-plane to scene
var waterPlaneMaterial = new THREE.MeshLambertMaterial( {color: "rgb(100,100,150)", side: THREE.DoubleSide} );
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
var textureLoaded = false;
var textureLoader = new THREE.TextureLoader();
textureLoader.load('./res/cubes.png', function (texture){
	console.log('texture loaded');
	texture.flipY = false;
	textureLoaded = true;
	chunkManagerTexture = texture;
}, undefined, function (err) {
	console.error('texture not loaded', err)
});

var chunkManager;
var chunkManagerInitialized = false;

animate();

function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}