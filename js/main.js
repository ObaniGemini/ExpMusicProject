const main = () => {
	setStartTime();

	initScreen();
	initSound();

	changeState( STATE_NORMAL );

	think();
}


const think = () => {
	time = ( ( new Date() ).getTime() - startTime ) / second;
	animTime = time / multiplier

	if( noiseForce > 0 ) {
		noiseForce -= noiseForce / 20;
	}

	if( launchState != null ) {
		launchState();
	}

	checkOscs();

	if( state == STATE_GLITCH ) {
		setNoise( filterMin + glitchStep * 10000 );
	} else {
		setNoise( noiseForce );
	}

	window.requestAnimationFrame( think );
}


window.addEventListener( "load",  main );