var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("myCanvas"),
										antialias: true} );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("rgb(255, 0, 0)");
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

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshLambertMaterial({color: "rgb(100, 255, 200)"});
var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

camera.position.z = 5;

var animate = function () {
	requestAnimationFrame( animate );

	controls.update();
	renderer.render(scene, camera);
};

var worldData = new WorldData();

// Load the texture asynchronously
var textureLoader = new THREE.TextureLoader();
textureLoader.load('./res/cubes.png', function (texture){
	console.log('texture loaded');
	texture.flipY = false;

	var layerManager = new LayerManager(texture, scene, worldData);

	animate();
}, undefined, function (err) {
	console.error('texture not loaded', err)
});