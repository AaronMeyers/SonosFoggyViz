SinewaveModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

SinewaveModule.prototype.on = function() {
	this.scene.add( this.node );
}

SinewaveModule.prototype.off = function() {
	this.scene.remove( this.node );
}

SinewaveModule.prototype.init = function() {

	// initialize a bunch of rects
	var numRects = 32;
	var totalWidth = WIDTH / numRects;
	var margin = 20;
	var rectWidth = totalWidth - margin;
	this.rects = new Array();
	for ( var i=0; i<numRects; i++ ) {
		var rect = new Rect( i * totalWidth, 0, rectWidth, 500 );
		this.rects.push( rect );
		this.node.add( rect.node );
	}
	// sinewave stuff
	this.sineSeed = 0;
	this.sineSpeed = .01;
	this.sineSpeedMultiplier = 1;
	this.amplitude = 100;
	this.xRotation = 0;
	this.zRotation = 0;
	this.gui.add( this, "sineSpeed" );
	this.gui.add( this, "amplitude", 100, 300 );
	this.gui.add( this, "xRotation" );

	// scrolling
	this.scrollSpeed = 1;
	this.scrollMultiplier = 1;
	this.gui.add( this, 'scrollSpeed', -50, 50 );

	// audio
	this.lastHit = new Date().getTime();
	this.hitThreshold = 1000;
	gui.add( this, 'hitThreshold', 100, 1000 );
}

SinewaveModule.prototype.update = function() {

	if ( this.audio.useAudio ) {
		if ( audio.kick_det.isKick() ) {
			this.flashFill();
		}
		
		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				console.log( sinceLastHit + '/' + this.hitThreshold );
				this.lastHit = time;

				var option = Math.floor( utils.random( 2 ) );
				if ( option == 0 ) {
					this.turboSine( 'xRotation' );
				}
				else if ( option == 1 ) {
					this.turboSine( 'zRotation' );
				}
			}
		}
	}

	this.sineSeed += this.sineSpeed * this.sineSpeedMultiplier;

	for ( var r in this.rects ) {
		var step = r / this.rects.length
		var rect = this.rects[r];
		var sineVal = Math.sin( this.sineSeed + step * Math.PI * 4.0 );
		rect.node.position.y = sineVal * this.amplitude;
		rect.setRotationX( sineVal * this.xRotation );
		rect.setRotationZ( sineVal * this.zRotation );
		// rect.setHeight( 500 - Math.max(this.vu_levels[r] * 500.0, .1 ) );

		// rect.setHeight( Math.abs( rect.node.position.y ) * 3 );
	}

	for ( var n in this.node.children ) {
		var node = this.node.children[n];
		node.position.x -= this.scrollSpeed * this.scrollMultiplier;
		if ( node.position.x > WIDTH )
			node.position.x -= WIDTH;
		else if ( node.position.x < 0 )
			node.position.x += WIDTH;
	}
}


SinewaveModule.prototype.setFill = function( fill ) {
	this.filled = fill;
	for ( var r in this.rects ) {
		this.rects[r].setFill( this.filled );
	}
}
SinewaveModule.prototype.flashFill = function() {
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

SinewaveModule.prototype.turboSine = function( property ) {

	var tweenObj = {};
	if ( property == 'xRotation' )
		tweenObj[property] = Math.PI*.5 * utils.randomSign();
	else
		tweenObj[property] = utils.random(Math.PI*.5,Math.PI) * utils.randomSign();
		

	var tweenBackObj = {};
	tweenBackObj[property] = 0;

	var tween = new TWEEN.Tween(this)
			.to(tweenObj, 100) // scroll multiplier always jumps speed up to 100
			.start();

		var tweenBack = new TWEEN.Tween(this)
			.to(tweenBackObj, 500 )
			.easing( TWEEN.Easing.Quadratic.InOut );

		tween.chain(tweenBack);

}

SinewaveModule.prototype.key = function( key ) {
	if ( key == 'Q' ) {
		this.turboSine( 'xRotation' );
	}
	if ( key == 'W' ) {
		this.turboSine( 'zRotation' );
	}
}