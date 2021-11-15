class Cell {
	constructor( x, y, w, h, props={}, moveCallback=null, downCallback=null, upCallback=null ) {
		this.grad = 0;

		this.offsetX = 0;
		this.offsetY = 0;

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.r = 255;
		this.g = 255;
		this.b = 255;
		this.a = 255;

		this.rot = 0;
		
		this.prop = props;

		this.cell = document.createElement("div");
		this.cell.className = "cell";

		this.cell.style.left = topx( x );
		this.cell.style.top = topx( y );
		this.cell.style.width = topx( w );
		this.cell.style.height = topx( h );

		if( moveCallback != null ) this.cell.addEventListener( "mousemove", ( event ) => moveCallback( this, event ) );
		if( downCallback != null ) this.cell.addEventListener( "mousedown", ( event ) => downCallback( this, event ) );
		if( upCallback != null ) this.cell.addEventListener( "mouseup", ( event ) => upCallback( this, event ) );

		this.selected = false;
	}


	dimensions( x, y, w, h ) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.cell.style.left = topx( x );
		this.cell.style.top = topx( y );
		this.cell.style.width = topx( w );
		this.cell.style.height = topx( h );
	}


	rotate( rot ) {
		let value = 'rotate(' + parseInt( rot ) + 'deg)';
		this.rot = rot % 360;

		this.cell.style.webkitTransform = value; 
    	this.cell.style.mozTransform	= value; 
    	this.cell.style.msTransform		= value; 
    	this.cell.style.oTransform		= value; 
    	this.cell.style.transform		= value; 
	}


	setColor( r, g, b ) {
		this.r = clamp( r, 0, 255 );
		this.g = clamp( g, 0, 255 );
		this.b = clamp( b, 0, 255 );
		this.cell.style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b + ')';
	}


	setPhysics( vertical, horizontal, angular ) {
		this.vx = vertical;
		this.vy = horizontal;
		this.va = angular;
	}

	updatePhysics() {
		if( this.selected )
			this.va *= 0.95;
		else
			this.dimensions( this.x + this.vx, this.y + this.vy, this.w, this.h );
		this.rotate( this.rot + this.va );
	}
}