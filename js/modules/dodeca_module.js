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
	this.lastHit = new Date().getTime();
	this.hitThreshold = 500;
	this.gui.add( this, 'hitThreshold', 100, 1000 );
}

DodecaModule.prototype.update = function() {

	if ( this.audio.useAudio ) {
		if ( audio.kick_det.isKick() ) {
			this.flashFill();
		}
		
		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				this.lastHit = time;

				var option = Math.floor( utils.random( 3 ) );
				if ( option == 0 ) {
					this.squishUp();
				}
				else if ( option == 1 ) {
					this.squishDown();
				}
				else if ( option == 2 ) {
					var shiftSpots = Math.floor( utils.random( 1, 3 ) );
					var dir = utils.randomSign();
					this.shift( shiftSpots * dir );
				}
			}
		}
	}

	for ( var r in this.rects )
		this.rects[r].update();

}

DodecaModule.prototype.squishUp = function() {
	if ( this.squished ) {
		this.unsquish();
		return;
	}

	for ( r in this.rects )
		this.rects[r].extend( 200, -1, 250, (200/this.rects.length)*utils.random(this.rects.length) );
	this.squished = true;
}

DodecaModule.prototype.squishDown = function() {
	if ( this.squished ) {
		this.unsquish();
		return;
	}

	for ( r in this.rects )
		this.rects[r].extend( 200, 1, 250, (200/this.rects.length)*utils.random(this.rects.length) );
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
DodecaModule.prototype.setFill = function( fill ) {
	this.filled = fill;
	for ( var r in this.rects ) {
		this.rects[r].setFill( this.filled );
	}
}
DodecaModule.prototype.flashFill = function() {
	this.setFill( true );
	var tween = new TWEEN.Tween({module:this, material:planeMaterial, opacity:planeMaterial.opacity})
		.to({opacity:0}, 250 )
		.onUpdate( function() {
			this.material.opacity = this.opacity;
		})
		.onComplete( function() {
			// after we've faded out the fill, turn the fill off and set the material back to being fully opaque
			this.module.setFill( false );
			this.material.opacity = 1.0;
		})
		.start();
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