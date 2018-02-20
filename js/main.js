var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("myCanvas"),
										antialias: true} );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("rgb(255, 0, 0)");
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera, renderer.domElement );

var ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.8);
scene.add(ambientLight);

var pointLight = new THREE.PointLight("rgb(255, 255, 255)", 1);
pointLight.position.y = 1;
pointLight.position.z  =1;
scene.add(pointLight);

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


let chunk = new Chunk([0, 0, 0]);

// Load the texture asynchronously
var textureLoader = new THREE.TextureLoader();
textureLoader.load('./res/cubes.png', function (texture){
	console.log('texture loaded');
	texture.flipY = false;
	var chunkMaterial = new THREE.MeshLambertMaterial( {map: texture});

	var chunkGeometry = new THREE.BufferGeometry();
	chunkGeometry.addAttribute('position', new THREE.BufferAttribute(chunk.verticesArray,3));
	chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(chunk.normalsArray,3));
	chunkGeometry.addAttribute('uv', new THREE.BufferAttribute(chunk.texCoordsArray,2));
	chunkGeometry.setIndex( new THREE.BufferAttribute(chunk.indexArray,1));

	chunkGeometry.drawRange = { start: 0, count: chunk.verticesCount }

	var chunkMesh = new THREE.Mesh(chunkGeometry, chunkMaterial);

	scene.add(chunkMesh);

	animate();
}, undefined, function (err) {
	console.error('texture not loaded', err)
});