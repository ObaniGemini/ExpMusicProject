const SAMPLERATE = 48000;

var ac = null;
var master = null;

var bgOsc = [];
var osc = [];

var filterMin = 440;



const numNotes = 100;
const gammeBasis = 25;
const MODE_RELEASE = 0, MODE_ATTACK = 1, MODE_ADSR = 2;

var notes = [];
var gamme = [];


var soundState = 0;







const makeNotes = () => {
	for( let i = 0; i < numNotes; i++ ) {
		notes.push( parseInt( Math.pow( 2, ( i - 49 ) / 12 ) * 440 ) );
	}

	let octaves = 12 * 4;
	for( let i = 0; i < octaves; i += 12 ) {
		gamme.push( i + gammeBasis );
		gamme.push( i + gammeBasis + 2 );
		gamme.push( i + gammeBasis + 3 );
		gamme.push( i + gammeBasis + 5 );
		gamme.push( i + gammeBasis + 7 );
		gamme.push( i + gammeBasis + 8 );
		gamme.push( i + gammeBasis + 10 );
	}
}




const initSound = () => {
	makeNotes();


	let AudioContext = window.AudioContext || window.webkitAudioContext;
	ac = new AudioContext( { latencyHint: 'interactive', sampleRate: SAMPLERATE } );
	master = ac.createGain();

	master.gain.value = 1.0;
	master.connect( ac.destination );


	let bufferSize = 2 * ac.sampleRate;
	let noiseBuffer = ac.createBuffer( 1, bufferSize, ac.sampleRate );
	let output = noiseBuffer.getChannelData( 0 );
	for( let i = 0; i < bufferSize; i++ ) {
	    output[ i ] = Math.random() * 2 - 1;
	}

	bgOsc = {
		"osc" : ac.createBufferSource(),
		"amp" : ac.createGain(),
		"fil" : ac.createBiquadFilter()
	};

	bgOsc[ "amp" ].gain.value = 0.15;
	bgOsc[ "amp" ].connect( master );

	bgOsc[ "osc" ].buffer = noiseBuffer;
	bgOsc[ "osc" ].loop = true;


	bgOsc[ "fil" ].type = 'lowpass';
	bgOsc[ "fil" ].frequency.setValueAtTime( filterMin, 0 );


	bgOsc[ "osc" ].connect( bgOsc[ "fil" ] );
	bgOsc[ "fil" ].connect( bgOsc[ "amp" ] );
	bgOsc[ "osc" ].start();
}


const setNoiseFreq = ( freq ) => {
	filterMin = clamp( freq, 0, SAMPLERATE/2 );
}


const setNoise = ( freqboost ) => {
	bgOsc[ "fil" ].frequency.setValueAtTime( clamp( filterMin + freqboost, 0, SAMPLERATE/2 ), ac.currentTime + 0.025 );
}


const boostVolume = ( modifier ) => {
	console.log( "Volume set to " + master.gain.value );
	master.gain.setValueAtTime( clamp( master.gain.value + modifier, 0, 1 ), ac.currentTime + 0.1 );
}




const checkOscs = () => {
	let now = ac.currentTime;
	for( let i = osc.length - 1; i > 0; i-- ) {
		if( osc[ i ][ "end" ] < now && osc[ i ][ "mod" ] == MODE_RELEASE ) {
			osc.splice( i, 1 );
		}

		else if( osc[ i ][ "end" ] < now && osc[ i ][ "mod" ] == MODE_ADSR ) {
			osc[ i ][ "end" ] = now + osc[ i ][ "rls" ];
			osc[ i ][ "osc" ].stop( osc[ i ][ "end" ] );
			osc[ i ][ "mod" ] = MODE_RELEASE;
			osc[ i ][ "amp" ].gain.linearRampToValueAtTime( 0, now + osc[ i ][ "rls" ] );
		}

		else if( "pan" in osc[ i ] ) {
			let c = cells[ osc[ i ][ "cell" ] ];
			osc[ i ][ "pan" ].pan.value = clamp( ( c.x + c.w/2 - centerX )/ centerX, -1, 1 );
		}
	}
}



const WaveSFX = ( freq, volume, length, mode=MODE_RELEASE, pan=false, type='sine' ) => {
	let now = ac.currentTime;

	let o = {
		"osc" : ac.createOscillator(),
		"amp" : ac.createGain(),
		"end" : now + length,
		"mod" : mode
	};

	o[ "amp" ].gain.value = volume * ( mode == MODE_RELEASE );
	o[ "amp" ].gain.linearRampToValueAtTime( volume * ( mode != MODE_RELEASE ), now + length );
	if( pan ) {
		o[ "pan" ] = ac.createStereoPanner();
		o[ "amp" ].connect( o[ "pan" ] );
		o[ "pan" ].connect( master );
	} else {
		o[ "amp" ].connect( master );
	}

	o[ "osc" ].type = type;
	o[ "osc" ].frequency.value = freq;
	o[ "osc" ].connect( o[ "amp" ] );

	o[ "osc" ].start( now );
	if( mode == MODE_RELEASE ) {
		o[ "osc" ].stop( now + length );
	}

	return osc.push( o );
}


const WaveADSRSFX = ( freq, volume, timeIn, timeOut, pan=false, type='sine' ) => {
	osc[ WaveSFX( freq, volume, timeIn, MODE_ADSR, pan, type ) - 1 ][ "rls" ] = timeOut;
}


const genCellNote = ( start, end ) => {
	WaveSFX( notes[ gamme[ start + parseInt( Math.random() * ( end - start ) ) ] ], 0.1, 2, MODE_RELEASE );
}



const genFade = ( start, end, detuneFact ) => {
	let fade = [];
	for( let i = 0; i < end - start; i++ ) fade.push( notes[ start + i ] + i * detuneFact );
	fade.forEach( note => {
		WaveADSRSFX( note, 0.05, 12.5, 10 );
	} );
}