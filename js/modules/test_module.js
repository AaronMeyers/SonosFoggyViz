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
	this.audioModes = [ 'vu', 'fft', 'spectral centroid', 'noisiness' ];
	this.audioMode = this.audioModes[2];

	this.gui.add( this, 'audioMode', this.audioModes );

	this.curRect = 0;

	var geometry = new THREE.PlaneGeometry( 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color:0xffffff} );
	for ( var i=0; i<count; i++ ) {
		var mesh = new THREE.Mesh( geometry, material.clone() );
		mesh.position.set( ( i / (count-1) ) * WIDTH, 0, 0 );
		mesh.scale.x = 5;
		mesh.scale.y = 200;

		this.node.add( mesh );
		this.rects.push( mesh );
	}

	this.avgRect = new THREE.Mesh( geometry, material.clone() );
	this.avgRect.position.z = -1;
	this.avgRect.material.color = new THREE.Color( "grey" );
	this.avgRect.position.x = WIDTH/2;
	this.avgRect.scale.x = WIDTH;
	this.node.add( this.avgRect );
}

TestModule.prototype.key = function( key ) {
	
}

TestModule.prototype.update = function() {

	if ( this.audio.vu.vu_levels.length == 0 )
		return;


	if ( this.audioMode == 'spectral centroid' || this.audioMode == 'noisiness' ) {
		var rect = this.rects[this.curRect];

		if ( this.audioMode == 'spectral centroid' ) {
			var ceiling = 1.8;
			var diff = Math.min( utils.roundToDecimal( this.audio.spectralCentroid / this.audio.spectralAvg, 1 ), ceiling );
			rect.scale.y = audio.spectralCentroid * 2;
			if ( diff >= 1.0 ) {
				var hue = ceiling - diff;
				rect.material.color.setHSL( hue, 1.0, .5 );
			}
			else
				rect.material.color.setRGB( 255, 255, 255 );
			this.avgRect.scale.y = audio.spectralAvg * 2;
		}
		else {
			var diff = Math.min( utils.roundToDecimal( this.audio.noisiness / audio.noiseAvg, 1 ), 1.5 );
			rect.scale.y = audio.noisiness * 5;
			if ( diff >= 1.0 ) {
				var hue = 1.5 - diff;
				rect.material.color.setHSL( hue, 1.0, .5 );
			}
			else
				rect.material.color.setRGB( 255, 255, 255 );
			this.avgRect.scale.y = audio.noiseAvg * 5;
		}
		if(++this.curRect==this.rects.length)
			this.curRect = 0;
	}
	else {
	// console.log(this.curRect + " " + this.rects.length);

		for ( var i=0; i<this.audio.vu.vu_levels.length; i++ ) {
			var rect = this.rects[i];
			var vu = ( this.audioMode == 'vu' ) ? this.audio.vu.vu_levels[i] : audio.fft.spectrum[i*4] * 20.0;

			// if ( displayFFT )
			// 	vu = audio.fft.spectrum[i*4] * 10.0;
			vu = Math.max( .01, vu );
			rect.scale.y = 250.0 * vu;
		}
	}


}