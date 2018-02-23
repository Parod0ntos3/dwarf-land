var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("myCanvas"),
										antialias: true} );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("rgb(150, 150, 175)");
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );

var ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.3);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight("rgb(255, 255, 255)", 0.8);
directionalLight.position.set( 1, 1.75, 1 );
directionalLight.position.multiplyScalar( 30 );
scene.add(directionalLight);

camera.position.z = 5;

var animate = function () {
	requestAnimationFrame( animate );

	controls.update();
	renderer.render(scene, camera);
};

var worldData = new WorldData();

var worldSideLength = worldData.chunkSize.x * worldData.numberOfChunks.x;
var planeMaterial = new THREE.MeshBasicMaterial( {color: "rgb(100,100,150)", side: THREE.DoubleSide} );
var planeGeometry = new THREE.PlaneGeometry( worldSideLength, worldSideLength, 1 );
var planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
planeMesh.position.x = 0;
planeMesh.position.y = 7.5;
planeMesh.position.z = 0;
planeMesh.rotation.x = THREE.Math.degToRad(90);
scene.add(planeMesh);

// Load the texture asynchronously
var textureLoader = new THREE.TextureLoader();
textureLoader.load('./res/cubes.png', function (texture){
	console.log('texture loaded');
	texture.flipY = false;

	var chunkManager = new ChunkManager(texture, scene, worldData);

	animate();
}, undefined, function (err) {
	console.error('texture not loaded', err)
});