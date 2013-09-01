SplitterModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

SplitterModule.prototype.on = function() {
	this.scene.add( this.node );
}

SplitterModule.prototype.off = function() {
	this.scene.remove( this.node );
}

SplitterModule.prototype.init = function() {

	this.filled = false;
	this.rects = new Array();

	var startRect = new Rect( window.innerWidth/2, 0, window.innerWidth - 10, 100, this.filled );
	this.node.add( startRect.node );
	this.rects.push( startRect );

	this.scrollSpeed = 1;
	this.scrollMultiplier = 1;
	this.gui.add( this, 'scrollSpeed', -50, 50 );
}

SplitterModule.prototype.update = function() {

	for ( var r in this.rects ) {
		var rect = this.rects[r];

		rect.update();
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

SplitterModule.prototype.setFill = function( fill ) {
	this.filled = fill;
	for ( var r in this.rects ) {
		this.rects[r].setFill( this.filled );
	}
}

SplitterModule.prototype.key = function( key ) {

	if ( key == 'A' ) {
		var tween = new TWEEN.Tween(this)
			.to({scrollMultiplier:Math.abs(100/this.scrollSpeed)}, 100) // scroll multiplier always jumps speed up to 100
			.start();

		var tweenBack = new TWEEN.Tween(this)
			.to({scrollMultiplier:1}, 500 )
			.easing( TWEEN.Easing.Quadratic.InOut );

		tween.chain(tweenBack);
	}

	if ( key == 'Q' ) {
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

	if ( key == 'F' ) {
		// toggle fill mode on rects
		this.setFill( !this.filled );
	}

	if ( key == 'S' ) {
		var rect = utils.random(this.rects);
		var newRects = rect.split( 10 );
		for ( var r in newRects ) {
			// add new rect's node to the top node
			// this.node.add( newRects[r].node );
			// add it to our rect array
			this.rects.push( newRects[r] );
		}
		// get rid of the rect we just split
		var removalIndex = this.rects.indexOf( rect );
		this.rects.splice( removalIndex, 1 );
		// take it out of the scene graph too
		rect.node.parent.remove( rect.node );
	}
}