const second = 1000;
const minute = second * 60;
const hour = minute * 60;

const PI2 = 6.28318;

const multiplier = 4;
var startTime = 0;
var time = 0;

var mouseX = -1;
var mouseY = -1;
var lastMouseX = -1;
var lastMouseY = -1;



const maxSigned = ( A, B ) => Math.abs( A ) > Math.abs( B ) ? A : B;

const distance = ( X1, Y1, X2, Y2 ) => {
	let dx = X2 - X1;
	let dy = Y2 - Y1;
	return Math.sqrt( dx*dx + dy*dy );
}


const clamp = ( basis, min, max ) => Math.max( min, Math.min( max, basis ) );

const topx = ( num ) => parseInt( num ) + "px";

const setStartTime = () => startTime = ( new Date() ).getTime();