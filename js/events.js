const STATE_NORMAL = 0, STATE_GLITCH = 1, STATE_FADE = 2, STATE_PLAYGROUND = 3;

const LIMIT_FADE = 1.75;

var timeFade1, timeFade2, timeFade3, timeFade4;

var noiseForce = 0;

var glitchStep = 0, glitchStopTime = 0;

var oldstate = 0;
var state = 0;

var keys = {};

var launchState = null;


const mouseMove = ( event ) => {
	if( state == STATE_FADE )
		return;

	lastMouseX = mouseX;
	lastMouseY = mouseY;

	mouseX = event.clientX;
	mouseY = event.clientY;

	if( lastMouseX != -1 ) {
		noiseForce += distance( lastMouseX, lastMouseY, mouseX, mouseY ) / 5;
	}
}


const keyDown = ( event ) => {
	//handle master volume
	if( event.key == "Add" || event.key == "+" )
		boostVolume( 0.05 );
	if( event.key == "Substract" || event.key == "-" )
		boostVolume( -0.05 );


	if( ( event.key == "Spacebar" || event.key == " " ) && state != STATE_FADE && ( !keys[ "Spacebar" ] && !keys[ " " ]  ) ) {
		changeState( STATE_GLITCH );
	}

	keys[ event.key ] = true;
}


const keyUp = ( event ) => {
	if( ( ( event.key == "Spacebar" && keys[ "Spacebar" ] ) ||
		( event.key == " " && keys[ " " ] ) ) &&
		state == STATE_GLITCH ) {
		changeState( oldstate )
	}

	keys[ event.key ] = false;
}





const cellEvent = ( event ) => {
	if( event.detail )
		genCellNote( 8, 15 );
	else
		genCellNote( 0, 8 );

	fade += 0.075;
	setNoiseFreq( filterMin - 15 );

	if( fade > LIMIT_FADE && !( "t" in cells[ 0 ][ 0 ].prop ) ) {
		cells[ 0 ][ 0 ].prop[ "t" ] = time;
		cells.forEach( line => line.forEach( cell => {
			cell.prop[ "r" ] = cell.r;
			cell.prop[ "g" ] = cell.g;
			cell.prop[ "b" ] = cell.b;
		} ) );
	}
}



const changeState = ( newState ) => {
	switch( newState ) {
	case STATE_GLITCH:
		glitchStopTime = animTime;
		break;

	case STATE_FADE:
		fade = 0;
		cells.forEach( cell => cell.selected = false );
		setStartTime();
		timeFade1 = 10;
		timeFade2 = 20;
		timeFade3 = 30;
		timeFade4 = 45;
		genFade( 16, 20, 1 );
		break;


	case STATE_PLAYGROUND:
		if( oldstate == newState )
			break;
		window.removeEventListener( "resize", updateScreen1 );
		cells.forEach( line => line.forEach( cell => cell.cell.remove() ) );

		cells = [];

		setStartTime();

		initPlayground();
		break;

	default: break;

	}

	launchState = null;

	oldstate = state;
	state = newState;

	switch( newState ) {
	case STATE_NORMAL: launchState = normalState; break;
	case STATE_GLITCH: launchState = glitchState; break;
	case STATE_FADE: launchState = fadeState; break;
	case STATE_PLAYGROUND: launchState = animatePlayground; break;
	}
}



const normalState = () => {
	animate();
	let pass = true;
	cells.forEach( line => {
		if( !Array.isArray( line ) )
			return;
		line.forEach( cell => {
			if( cell.r + cell.g + cell.b != 0 ) {
				pass = false;
				return;
			}
		} );
	} );
	if( pass ) {
		cells.forEach( line => {
			if( !Array.isArray( line ) )
				return;
			line.forEach( cell => { cell.selected = false; cell.prop[ "grad" ] = 0; } );
		} );
		changeState( STATE_FADE );
	}
}


const glitchState = () => {
	glitchStep = glitchStep == 0 ? 0.1 : 0;
	if( oldstate == STATE_PLAYGROUND ) animatePlayground();
	else animateGlitch();
}


const fadeState = () => {
	animateFade();

	if( time > timeFade1 && soundState <= 0 ) {
		soundState = 1;
		genFade( 22, 28, -16 );
	}

	else if( time > timeFade2 && soundState <= 1 ) {
		soundState = 2;
		genFade( 26, 32, 2 );
	}

	else if( time > timeFade3 && soundState <= 2 ) {
		soundState = 3;
		genFade( 34, 42, -3 );
	}

	if( soundState == 0 ) {
		fade = ( timeFade1 - time ) * 0.25;
	} else {
		fade = 2.5 + ( time - timeFade4 ) * 0.1;
		setNoiseFreq( ( time - timeFade2 - 5 ) * 3 );
	}

	if( time > timeFade4 ) {
		changeState( STATE_PLAYGROUND );
	}
}