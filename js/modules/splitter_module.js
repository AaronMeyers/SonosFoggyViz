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

	this.spinning = false;
}

SplitterModule.prototype.update = function() {

	for ( var r in this.rects ) {
		var rect = this.rects[r];

		rect.update();

		if ( this.spinning ) {
			rect.node.position.x += 10;
			if ( rect.node.position.x - rect.getWidth()/2 > window.innerWidth ) {
				rect.node.position.x -= window.innerWidth;
			}
		}

	}

}

SplitterModule.prototype.key = function( key ) {

	if ( key == 'M' ) {
		this.spinning = !this.spinning;
	}

	if ( key == 'F' ) {
		// toggle fill mode on rects
		this.filled = !this.filled;
		for ( var r in this.rects ) {
			this.rects[r].setFill( this.filled );
		}
	}

	if ( key == 'S' ) {
		var rect = utils.random(this.rects);
		var newRects = rect.split( 10 );
		for ( var r in newRects ) {
			// add new rect's node to the top node
			this.node.add( newRects[r].node );
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