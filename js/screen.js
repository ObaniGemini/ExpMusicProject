const numCellsL = 15, numCellsH = 15;

const timeStretch = 200, timeStretch2 = timeStretch / 2;

var cellW, cellH;
var centerX, centerY;

var mainDiv = null;
var cells = [];

var fade = 0;

var animTime = 0;



const initScreen = () => {
	mainDiv = document.getElementById( "mainDiv" );
	updateScreen1();

	window.addEventListener( "resize", updateScreen1 );	//resize image

	window.addEventListener( "mousemove", ( event ) => { mouseMove( event ) } );
	window.addEventListener( "keydown", ( event ) => { keyDown( event ) } );
	window.addEventListener( "keyup", ( event ) => { keyUp( event ) } );
	window.addEventListener( "clickedCell", ( event ) => { cellEvent( event ); } );

	for( let i = 0; i < numCellsH; i++ ) {
		cells.push( [] );
		for( let j = 0; j < numCellsL; j++ ) {
			cells[ i ].push( new Cell( j * cellW, i * cellH, cellW, cellH, { "grad" : 0 }, mouseMove1, mouseDown1 ) );
			mainDiv.appendChild( cells[ i ][ j ].cell );
		}
	}
}


const updateScreen1 = () => {
	centerX = window.innerWidth / 2;
	centerY = window.innerHeight / 2;

	cellW = window.innerWidth / numCellsL;		//Set cells size
	cellH = window.innerHeight / numCellsH;

	mainDiv.setAttribute( "width", window.innerWidth );	//Set canvas size
	mainDiv.setAttribute( "height", window.innerHeight );

	cells.forEach( ( line, i ) => {
		line.forEach( ( cell, j ) => cell.dimensions( j * cellW, i * cellH, cellW, cellH ) );
	} );
}


const animate = () => {
	let t;
	if( fade > LIMIT_FADE ) {
		t = ( time - cells[ 0 ][ 0 ].prop[ "t" ] ) * 20;
	}

	cells.forEach( ( line, y ) => {
		if( !Array.isArray( line ) )
			return;
		line.forEach( ( cell, x ) => {
			let pos = Math.abs( Math.cos( animTime + y + x ) );

			cell.dimensions( x * cellW - pos * timeStretch2, cell.y, cellW + pos * timeStretch, cell.h );
			if( !cell.selected ) {
				let strength = parseInt( Math.cos( animTime * 8 + ( y + 1 ) * ( x + 1 ) ) * 4 - 1.5 - fade );
				updateColor( cell, strength );
			} else if( fade > LIMIT_FADE && cell.prop[ "r" ] != 0 ) {
				cell.setColor( cell.prop[ "r" ] - t, cell.prop[ "g" ] - t, cell.prop[ "b" ] - t );
			}
		} );
	} );
}



const animateGlitch = () => {
	cells.forEach( ( line, y ) => {
		line.forEach( ( cell, x ) => {
			let t = Math.abs( Math.cos( glitchStopTime + glitchStep + y + x ) );
			let pos = Math.abs( Math.cos( t + y + x ) );

			cell.dimensions( x * cellW - pos * timeStretch2, cell.y, cellW + pos * timeStretch, cell.h );
		} );
	} );
}


const animateFade = () => {
	let cellSize = cellW * ( numCellsL/( numCellsL - 1 ) );
	cells.forEach( ( line, y ) => {
		let s = ( y % 2 ) * 2 - 1;
		line.forEach( ( cell, x ) => {
			let t = animTime * 0.25 - parseInt( animTime * 0.25 + 0.75 );
			let posX = ( Math.sin( t * s * PI2 ) + x - ( y % 2 ) )*cellSize;

			cell.dimensions( posX, cell.y, cellSize, cell.h );
			updateColor( cell, parseInt( Math.sin( t * x * PI2 ) * 3 - fade ) );
		} );
	} );
}


const mouseMove1 = ( cell, event ) => {
	if( state == STATE_FADE || state == STATE_GLITCH )
		return;
	updateColor( cell, 20 );
}


const mouseDown1 = ( cell, event ) => {
	if( state == STATE_FADE )
		return;

	cell.selected = !cell.selected;

	if( cell.selected ) {
		if( fade > LIMIT_FADE ) {
			let t = ( time - cells[ 0 ][ 0 ].prop[ "t" ] ) * 20;
			cell.prop[ "r" ] = 75 + Math.random() * 10 - t;
			cell.prop[ "g" ] = 60 + Math.random() * 10  - t;
			cell.prop[ "b" ] = 0;
			cell.setColor( cell.prop[ "r" ], cell.prop[ "g" ], cell.prop[ "b" ] );
		} else {
			cell.setColor( 75 + Math.random() * 10, 60 + Math.random() * 10, 0 );
		}
	}

	window.dispatchEvent( new CustomEvent( "clickedCell", { detail: cell.selected } ) );
}


const updateColor = ( cell, strength ) => {
		if( cell.selected )
			return;

		cell.prop[ "grad" ] = clamp( cell.prop[ "grad" ] + strength, 0, 255 );
		cell.setColor( cell.prop[ "grad" ], cell.prop[ "grad" ], cell.prop[ "grad" ] );
}