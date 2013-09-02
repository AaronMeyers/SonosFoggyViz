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
	var numRects = 64;
	var totalWidth = window.innerWidth / numRects;
	var margin = 10;
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

	this.vu_levels = new Array();
	for ( var i=0;i<128; i++ ) {
		// console.log( 'blah' );
		this.vu_levels.push(.1);
	}
}

SinewaveModule.prototype.update = function() {

	if ( this.audio.vu.vu_levels.length > 0 ) {
		for ( l in this.vu_levels ) {

			this.vu_levels[l] = utils.lerp( this.vu_levels[l], this.audio.vu.vu_levels[l], .5 );
			// if ( l==32 ) console.log( this.vu_levels[l] );
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
		if ( node.position.x > window.innerWidth )
			node.position.x -= window.innerWidth;
		else if ( node.position.x < 0 )
			node.position.x += window.innerWidth;
	}
}

SinewaveModule.prototype.turboSine = function( property ) {

	var tweenObj = {};
	tweenObj[property] = utils.random(Math.PI/2,Math.PI) * utils.randomSign();

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