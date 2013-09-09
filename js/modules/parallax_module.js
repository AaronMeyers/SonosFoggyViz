ParallaxModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

ParallaxModule.prototype.on = function() {
	this.scene.add( this.node );
}

ParallaxModule.prototype.off = function() {
	this.scene.remove( this.node );
}

ParallaxModule.prototype.init = function() {

	this.scrollSpeed = 1;
	this.scrollMultiplier = 1;
	this.gui.add( this, 'scrollSpeed', -25, 25 ).listen();
	this.rectThickness = 10;

	this.rects = new Array();

	for ( var i=0; i<32; i++ ) {
		var width = utils.random( 50, 150 );
		var height = utils.random( 50, 150 );


		var rect = new Rect( utils.random( WIDTH ), utils.random( -HEIGHT/2 + height, HEIGHT/2 - height ), width, height, false, this.rectThickness );

		rect.vel = utils.random( 1, 20 );
		this.node.add( rect.node );
		this.rects.push( rect );
	}

	// this.lineManager = new LineManager(1000);
	// this.node.add( this.lineManager.mesh );


	this.lastHit = new Date().getTime();
	this.hitThreshold = 500;
	this.gui.add( this, 'hitThreshold', 100, 1000 );
}

ParallaxModule.prototype.update = function() {

	// this.lineManager.clear();

	if ( this.audio.useAudio ) {

		this.rectThickness = utils.cmap( this.audio.noisiness, 0, 80, 5, 20 );

		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				this.lastHit = time;
				// console.log( 'hit' );
			}
		}
	}

	for ( var r in this.rects ) {
		var rect = this.rects[r];
		rect.node.position.x += rect.vel * this.scrollSpeed * this.scrollMultiplier;

		if ( rect.node.position.x > WIDTH )
			rect.node.position.x -= WIDTH;
		if ( rect.node.position.x < 0 )
			rect.node.position.x += WIDTH;

		// this.lineManager.addLine( 0, 0, rect.node.position.x, rect.node.position.y );

		rect.setThickness( this.rectThickness );
		rect.update();
	}
	
	// this.lineManager.update();
}

ParallaxModule.prototype.throttle = function() {

	this.scrollSpeed *= utils.randomSign();

	var tween = new TWEEN.Tween(this)
		.to({scrollMultiplier:Math.abs(20/this.scrollSpeed)}, 100) // scroll multiplier always jumps speed up to 100
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({scrollMultiplier:1}, 500 )
		.easing( TWEEN.Easing.Quadratic.InOut );

	tween.chain(tweenBack);
}

ParallaxModule.prototype.key = function( key ) {
	if ( key == 'A' )
		this.throttle();
}