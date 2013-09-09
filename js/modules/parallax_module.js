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
	this.rectThicknessMultiplier = 1;
	this.dimMin = 50;
	this.dimMax = 150;


	this.converged = false;

	this.rects = new Array();

	this.rotator = new THREE.Object3D();
	this.rotator.position.x = WIDTH/2;
	this.node.add(this.rotator);
	this.gui.add( this.rotator.rotation, 'z', 0, Math.PI * 2 );

	for ( var i=0; i<100; i++ ) {
		var width = utils.random( this.dimMin, this.dimMax );
		var height = utils.random( this.dimMin, this.dimMax );

		var stuff = this.getRandomRectPositionAndScale();

		var rect = new Rect( stuff.x, stuff.y, stuff.width, stuff.height, false, this.rectThickness );

		rect.vel = utils.random( 1, 20 );
		this.rotator.add( rect.node );
		this.rects.push( rect );
	}

	this.rotationSpeed = .001;
	this.rotationSpeedMultiplier = 1;

	// this.lineManager = new LineManager(1000);
	// this.node.add( this.lineManager.mesh );


	this.lastHit = new Date().getTime();
	this.hitThreshold = 1000;
	this.gui.add( this, 'hitThreshold', 100, 2000 );
}

ParallaxModule.prototype.getRandomRectPositionAndScale = function() {
	return {
		width:utils.random( this.dimMin, this.dimMax ),
		height:utils.random( this.dimMin, this.dimMax ),
		x: utils.random(-WIDTH,WIDTH),
		y: utils.random(-HEIGHT,HEIGHT)
	}
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

				if ( this.converged )
					this.disperse();
				else {
					var option = Math.floor( utils.random( 4 ) );
					if ( option == 0 ) {
						this.converge();
					}
					else if ( option == 1 ) {
						this.throttleRotation();
					}
					else if ( option == 2 ) {
						this.throttle();
					}
					else if ( option == 3 ) {
						this.halt();
					}
				}
			}
		}

		if ( audio.kick_det.isKick() && !this.converged ) {
			this.flashFill();
		}
	}

	for ( var r in this.rects ) {
		var rect = this.rects[r];

		if ( !this.converged ) {
			rect.node.position.x += rect.vel * this.scrollSpeed * this.scrollMultiplier;
			if ( rect.node.position.x > WIDTH )
				rect.node.position.x -= WIDTH*2;
			if ( rect.node.position.x < -WIDTH )
				rect.node.position.x += WIDTH*2;
		}

		rect.setThickness( this.rectThickness * this.rectThicknessMultiplier );
		rect.update();
	}

	if ( !this.converged ) {
		this.rotator.rotation.z += this.rotationSpeed * this.rotationSpeedMultiplier;
	}
	
	// this.lineManager.update();
}

ParallaxModule.prototype.converge = function() {

	if ( this.converged ) {
		this.disperse();
		return;
	}

	var time = 300;

	for ( var i=0; i<this.rects.length; i++ ) {
		var rect = this.rects[i];
		var smaller = Math.random()>.5;
		rect.animate( 0, 0, smaller?1200:1800, smaller?450:900, time );
	}

	// tween the rect thickness up
	var tween = new TWEEN.Tween(this)
		.to({rectThicknessMultiplier:4}, time)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	var rotationTween = new TWEEN.Tween(this.rotator.rotation)
		.to({z:0},time)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	this.converged = true;
}

ParallaxModule.prototype.disperse = function() {
	
	this.rotationSpeed *= utils.randomSign();

	var time = 300;
	for ( var i=0; i<this.rects.length; i++ ) {
		var rect = this.rects[i];
		var stuff = this.getRandomRectPositionAndScale();
		rect.animate( stuff.x, stuff.y, stuff.width, stuff.height, time );
	}

	var tween = new TWEEN.Tween(this)
		.to({rectThicknessMultiplier:1}, time)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	var rotationTween = new TWEEN.Tween(this.rotator.rotation)
		.to({z:utils.random(-Math.PI,Math.PI)},time)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	this.converged = false;
};

ParallaxModule.prototype.throttleRotation = function() {
	this.rotationSpeed *= utils.randomSign();

	var tween = new TWEEN.Tween(this)
		.to({rotationSpeedMultiplier:Math.abs(.1/this.rotationSpeed)}, 100) 
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({rotationSpeedMultiplier:1}, 500 )
		.easing( TWEEN.Easing.Quadratic.InOut );

	tween.chain(tweenBack);
};


ParallaxModule.prototype.halt = function() {
	var tween = new TWEEN.Tween(this)
		.to({scrollMultiplier:0}, 250 )
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onComplete(function(){
			this.scrollSpeed *= utils.randomSign();
			// this.scrollSpeed *= -1;
		})
		.start();

	var tweenUp = new TWEEN.Tween(this)
		.to({scrollMultiplier:2}, 200 )
		.easing(TWEEN.Easing.Quadratic.InOut);

	var tweenBack = new TWEEN.Tween(this)
		.to({scrollMultiplier:1}, 200 )
		.easing(TWEEN.Easing.Quadratic.InOut);


	// tweenUp.chain(tweenBack);
	// tween.chain(tweenUp);

	tween.chain(tweenBack);
};

ParallaxModule.prototype.flashFill = function() {
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

ParallaxModule.prototype.setFill = function( fill ) {
	this.filled = fill;
	for ( var r in this.rects ) {
		this.rects[r].setFill( this.filled );
	}
}

ParallaxModule.prototype.throttle = function() {

	this.scrollSpeed *= utils.randomSign();

	var tween = new TWEEN.Tween(this)
		.to({scrollMultiplier:Math.abs(5/this.scrollSpeed)}, 100) // scroll multiplier always jumps speed up to 100
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({scrollMultiplier:1}, 500 )
		.easing( TWEEN.Easing.Quadratic.InOut );

	tween.chain(tweenBack);
}


ParallaxModule.prototype.key = function( key ) {
	if ( key == 'A' )
		this.throttle();

	if ( key == 'Q' )
		this.halt();

	if ( key == 'E' )
		this.converge();

	if ( key == 'W' )
		this.flashFill();

	if ( key == 'R' )
		this.throttleRotation();

}
















