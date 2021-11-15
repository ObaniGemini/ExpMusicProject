const timeNote = 60;

var mainCell = null;
var mainCellMin = 0;

var held = [ -1, -1, -1 ];

var middleMouseX = -1;
var middleMouseY = -1;

var numChords = 0;
var timeChords = [];

const initPlayground = () => {
	mainCell = new Cell( centerX - 1, centerY - 1, 1, 1, {}, null, mouseDownMain, null );
	
	updateScreen2();
	
	window.addEventListener( "mousemove", ( event ) => mouseMove2( event ) );
	window.addEventListener( "mouseup", ( event ) => mouseUp2( event ) );


	document.body.addEventListener( "mousedown", ( event ) => mouseDown3( event ) );
	document.body.addEventListener( "mousemove", ( event ) => mouseMove3( event ) );
	document.body.addEventListener( "mouseup", ( event ) => mouseUp3( event ) );

	mainCell.setColor( 255, 255, 255 );
	mainCell.cell.style.zIndex = 1;


	mainDiv.appendChild( mainCell.cell );

	window.addEventListener( "resize", updateScreen2 );
}


const updateScreen2 = () => {
	let ratioX = window.innerWidth / parseInt( mainDiv.getAttribute( "width" ) );		//Set cells size
	let ratioY = window.innerHeight / parseInt( mainDiv.getAttribute( "height" ) );

	centerX = window.innerWidth / 2;
	centerY = window.innerHeight / 2;

	mainDiv.setAttribute( "width", window.innerWidth );	//Set canvas size
	mainDiv.setAttribute( "height", window.innerHeight );

	mainCellMin = Math.max( window.innerWidth / numCellsL, window.innerHeight / numCellsH );

	mainCell.dimensions( mainCell.w * ratioX, mainCell.h * ratioY, mainCell.w * ratioX, mainCell.h * ratioY );

	cells.forEach( cell => cell.dimensions( cell.x * ratioX, cell.y * ratioY, mainCellMin * cell.prop[ "ratio" ], mainCellMin * cell.prop[ "ratio" ] ) );
}



const animatePlayground = () => {
	if( !mainCell.selected ) {
		let size = time * 10;
		if( size < mainCellMin ) size = size + ( mainCell.w - size ) * 0.925;
		else size = mainCellMin + ( mainCell.w - mainCellMin ) * 0.925;
		mainCell.dimensions( centerX - size/2, centerY - size/2, size, size );
	}

	if( cells.length > 1 && numChords < 1 ) {
		numChords = 1;
		timeChords.push( [ time, 50 ] );
		WaveADSRSFX( notes[ gamme[ 5 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 7 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 9 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 11 ] ] , 0.05, timeNote, timeNote );
	} else if( cells.length > 4 && numChords < 2 ) {
		numChords = 2;
		timeChords.push( [ time, 50 ] );
		WaveADSRSFX( notes[ gamme[ 8 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 11 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 14 ] ] , 0.05, timeNote, timeNote );
		WaveADSRSFX( notes[ gamme[ 15 ] ] , 0.05, timeNote, timeNote );
	} else if( cells.length > 8 && numChords < 3 ) {
		numChords = 3;
		timeChords.push( [ time, 50 ] );
		WaveADSRSFX( notes[ gamme[ 0 ] ], 0.2, timeNote, timeNote );
	}

	if( timeChords.length > 0 ) {
		document.body.style.backgroundColor = 'rgb(' + parseInt( timeChords.reduce( ( ( acc, cell ) => acc + Math.max( 0, Math.min( cell[ 1 ] * ( time - cell[ 0 ] )/timeNote, cell[ 1 ] * ( ( cell[ 0 ] + timeNote * 2 ) - time )/timeNote ) ) ), 0 ) ) + ',0,0)';
	}


	cells.forEach( cell => {
		if( middleMouseX != -1 && middleMouseY != -1 ) {
			let dx = cell.x - middleMouseX, dy = cell.y - middleMouseY, dmax = Math.abs( maxSigned( dx, dy ) );
			cell.setPhysics( cell.vx - ( dx/dmax ) * 0.25, cell.vy - ( dy/dmax ) * 0.25, cell.va );
		}

		if( state == STATE_GLITCH ) {
			cell.setPhysics( cell.vx * 0.95, cell.vy * 0.95, cell.va );
		}

		cell.updatePhysics();

		cell.vx = ( ( cell.x <= 0 && cell.vx < 0 ) || ( cell.x + cell.w >= window.innerWidth && cell.vx > 0 ) ) ? -cell.vx : cell.vx;
		cell.vy = ( ( cell.y <= 0 && cell.vy < 0 ) || ( cell.y + cell.h >= window.innerHeight && cell.vy > 0 ) ) ? -cell.vy : cell.vy;
	} );
}



const mouseMove2 = ( event ) => {
	if( mainCell.selected ) {
		let size = Math.max( Math.abs( event.clientX - centerX ) * 2 + mainCell.offsetX, Math.abs( event.clientY - centerY ) * 2 + mainCell.offsetY );
		mainCell.dimensions( centerX - size/2, centerY - size/2, size, size );

		held.forEach( freq => {
			let idx = osc.findIndex( element => ( "basis" in element && element[ "basis" ] == freq && element[ "mod" ] == MODE_ATTACK ) );
			if( idx != -1 )
				osc[ idx ][ "osc" ].frequency.value = freq + ( size - size/2 ) / 10;
				osc[ idx ][ "amp" ].gain.linearRampToValueAtTime( ( size / Math.max( window.innerWidth, window.innerHeight ) ) * 0.1, ac.currentTime + 0.05 )
		} );
	}

	cells.forEach( cell => {
		if( cell.selected ) {
			let posX = event.clientX - cell.offsetX, posY = event.clientY - cell.offsetY;
			cell.setPhysics( ( posX - cell.x )/8, ( posY - cell.y )/8, maxSigned( cell.va, maxSigned( ( posX - cell.x ), ( posY - cell.y ) )/20 ) );
			cell.dimensions( posX, posY, cell.w, cell.h );
		}
	} );
}


const mouseDown2 = ( cell, event ) => {
	if( event.button == 1 )
		return;

	cell.selected = true;
	cell.offsetX = event.clientX - cell.x;
	cell.offsetY = event.clientY - cell.y;
}


const mouseDownMain = ( cell, event ) => {
	if( event.button == 1 )
		return;

	cell.selected = true;
	cell.offsetX = event.clientX - cell.x;
	cell.offsetY = event.clientY - cell.y;

	for( let i = 0; i < 3; i++ ) {
		held[ i ] = parseInt( notes[ gamme[ 12 + parseInt( Math.random() * ( 24 - 12 ) ) ] ] );
		let idx = WaveSFX( held[ i ], 0.005, 0.25 + Math.random(), MODE_ATTACK ) - 1;
		osc[ idx ][ "basis" ] = held[ i ];
	}
}


const mouseUp2 = ( event ) => {
	if( mainCell.selected ) {
		mainCell.selected = false;

		held.forEach( freq => {
			let idx = osc.findIndex( element => ( "basis" in element && element[ "basis" ] == freq && element[ "mod" ] == MODE_ATTACK ) );
			if( idx != -1 ) {
				osc[ idx ][ "end" ] = ac.currentTime + Math.random() * 2 + 2;
				osc[ idx ][ "mod" ] = MODE_RELEASE;
				osc[ idx ][ "amp" ].gain.linearRampToValueAtTime( 0, osc[ idx ][ "end" ] );
				osc[ idx ][ "osc" ].stop( osc[ idx ][ "end" ] );
			}
		} );

		if( mainCell.w > mainCellMin * 1.05 ) {
			let ratio = 1 - Math.abs( Math.cos( time ) ) * 0.5;
			let size = ( time * 10 < mainCellMin ? time * 10 * ratio : mainCellMin * ratio );
			let wMin = Math.min( mainCell.w, window.innerWidth );
			let hMin = Math.min( mainCell.h, window.innerHeight );

			let cell = new Cell( centerX + Math.min( wMin * ( Math.random() - 0.5 ), wMin/2 - size ),
								 centerY + Math.min( hMin * ( Math.random() - 0.5 ), hMin/2 - size ),
							  size, size, { "ratio" : ratio }, null, mouseDown2, mouseUp2 );
			let note = parseInt( Math.random() * gamme.length );


			cell.setColor( 255 - gamme.length * 2 + note * 2, 255 - note * 2, 255 - gamme.length + note );
			cell.setPhysics( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
			mainDiv.appendChild( cell.cell );
			let cellIdx = cells.push( cell ) - 1;

			let oscIdx = WaveSFX( parseInt( notes[ gamme[ note ] ] + cell.vx + cell.vy ), 0.01 * ratio, 0.25, MODE_ATTACK, true ) - 1;
			osc[ oscIdx ][ "cell" ] = cellIdx;
		}
	}


	cells.forEach( ( cell, i ) => {
		if( cell.selected ) {
			cell.selected = false;

			if( cell.x + cell.w/2 < 0 ||
				cell.x + cell.w/2 > window.innerWidth ||
				cell.y + cell.h/2 < 0 ||
				cell.y + cell.h/2 > window.innerHeight )
			{
				osc.forEach( ( o, j ) => {
					if( "cell" in o ) {
						if( o[ "cell" ] == i ) {
							o[ "osc" ].stop( ac.currentTime );
							osc.splice( j, 1 );
							if( j != osc.length )
								osc[ j ][ "cell" ] -= 1;
						} else if( o[ "cell" ] > i ) {
							o[ "cell" ] -= 1;
						}
					}
				} );
				cell.cell.remove();
				cells.splice( i, 1 );
			}
		}
	} );
}


const mouseDown3 = ( event ) => {
	if( event.button == 1 ) {
		middleMouseX = event.clientX;
		middleMouseY = event.clientY;
	}
}

const mouseMove3 = ( event ) => {
	if( middleMouseX != -1 && middleMouseY != -1 ) {
		middleMouseX = event.clientX;
		middleMouseY = event.clientY;
	}
}

const mouseUp3 = ( event ) => {
	if( event.button == 1 ) {
		middleMouseX = -1;
		middleMouseY = -1;
	}
}