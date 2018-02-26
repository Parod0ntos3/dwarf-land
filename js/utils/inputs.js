// Initialize mouse with eventListeners
const mouse = {
	position : new THREE.Vector2(),
	leftClicked : false,
	rightClicked : false
}

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false);
document.addEventListener( 'mouseup', onDocumentMouseUp, false);


function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.position.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.position.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ){
    if(event.button === 0) {
        mouse.leftClicked = true;
    } else if(event.button === 2) {
    	mouse.rightClicked = true;
    }
}

function onDocumentMouseUp( event) {
    if(event.button === 0) {
        mouse.leftClicked = false;
    } else if(event.button === 2) {
    	mouse.rightClicked = false;
    }
}