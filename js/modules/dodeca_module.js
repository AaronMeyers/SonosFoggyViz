DodecaModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

DodecaModule.prototype.on = function() {
	this.scene.add( this.node );
}

DodecaModule.prototype.off = function() {
	this.scene.remove( this.node );
}

DodecaModule.prototype.init = function() {

	var margin = 40;
	this.slotWidth = ( WIDTH / 12 );
	this.restingHeight = HEIGHT - margin;
	this.rects = new Array();
	for ( var i=0; i<12; i++ ) {

		var rect = new Rect( i * this.slotWidth, 0, this.slotWidth - margin, this.restingHeight );
		this.rects.push( rect );
		this.node.add( rect.node );
	}

	this.squished = false;

}

DodecaModule.prototype.squishUp = function() {
	for ( r in this.rects )
		this.rects[r].extend( 100, -1, (200/this.rects.length)*utils.random(this.rects.length) );
	this.squished = true;
}

DodecaModule.prototype.squishDown = function() {
	for ( r in this.rects )
		this.rects[r].extend( 100, 1, (200/this.rects.length)*utils.random(this.rects.length) );
	this.squished = true;
}

DodecaModule.prototype.unsquish = function() {
	for ( r in this.rects )
		this.rects[r].animate( null, 0, null, this.restingHeight, 250, null, (200/this.rects.length)*utils.random(this.rects.length) );
	this.squished = false;
}

DodecaModule.prototype.shift = function( spots ) {

	for ( r in this.rects ) {
		var rect = this.rects[r];
		var callback = function() {
			if ( this.node.position.x > WIDTH )
				this.node.position.x -= WIDTH;
		}
		this.rects[r].animate( rect.node.position.x + spots * this.slotWidth, undefined, undefined, undefined, 200, callback );
	}

}

DodecaModule.prototype.update = function() {

}

DodecaModule.prototype.key = function( key ) {

	if ( key == 'E' ) {
		this.shift( 1 );
	}

	if ( key == 'Q' ) {
		if ( this.squished )
			this.unsquish();
		else
			this.squishDown();
	}
	if ( key == 'W' ) {
		if ( this.squished )
			this.unsquish();
		else
			this.squishUp();
	}
}