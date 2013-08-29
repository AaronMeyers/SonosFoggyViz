TestModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

TestModule.prototype.on = function() {
	this.scene.add( this.node );
}

TestModule.prototype.off = function() {
	this.scene.remove( this.node );
}

TestModule.prototype.init = function() {
	var count = 128;

	this.rects = new Array();
	this.audioModes = [ 'vu', 'fft' ];
	this.audioMode = this.audioModes[0];

	this.gui.add( this, 'audioMode', this.audioModes );

	var geometry = new THREE.PlaneGeometry( 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color:0xffffff} );
	for ( var i=0; i<count; i++ ) {
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( ( i / (count-1) ) * window.innerWidth, 0, 0 );
		mesh.scale.x = 5;
		mesh.scale.y = 200;

		this.node.add( mesh );
		this.rects.push( mesh );
	}
}

TestModule.prototype.update = function() {

	for ( var i=0; i<this.audio.vu.vu_levels.length; i++ ) {
		var rect = this.rects[i];
		var vu = ( this.audioMode == 'vu' ) ? this.audio.vu.vu_levels[i] : audio.fft.spectrum[i*4] * 20.0;

		// if ( displayFFT )
		// 	vu = audio.fft.spectrum[i*4] * 10.0;
		vu = Math.max( .01, vu );
		rect.scale.y = 250.0 * vu;
	}
}