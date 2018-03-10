const clock = {
	timeStampLastFrame: 0,
	delta: 0,
	initialized: false
}

function updateClock() {
	if(clock.initialized === false) {
		const date = new Date();
		clock.timeStampLastFrame = date.getTime();
		clock.initialized = true;
	} else {
		const date = new Date();
		let timeStamp = date.getTime();
		clock.delta = timeStamp - clock.timeStampLastFrame;
		clock.timeStampLastFrame = timeStamp;		
	}

}