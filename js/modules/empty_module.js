EmptyModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;

	this.lastHit = new Date().getTime();
	this.hitThreshold = 500;
	this.gui.add( this, 'hitThreshold', 100, 1000 );

	this.init();
}

EmptyModule.prototype.on = function() {
	this.scene.add( this.node );
}

EmptyModule.prototype.off = function() {
	this.scene.remove( this.node );
}

EmptyModule.prototype.init = function() {
	this.empty = "i'm empty!";
	this.gui.add( this, 'empty' );
}

EmptyModule.prototype.update = function() {
	if ( this.audio.useAudio ) {

		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				this.lastHit = time;
				// console.log( 'hit' );
			}
		}
	}
}

EmptyModule.prototype.key = function( key ) {

}