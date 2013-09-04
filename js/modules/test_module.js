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

	this.curRect = 0;

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

TestModule.prototype.key = function( key ) {
	
}

TestModule.prototype.update = function() {

	if ( this.audio.vu.vu_levels.length == 0 )
		return;

	var spectralCentroid = 0;
	var spectralWeights = 0;
	var n = this.audio.fft.spectrum.length;
	for(var i = 0; i < n; i++) {
		var curWeight = this.audio.fft.spectrum[i];
		spectralCentroid += i * curWeight;
		spectralWeights += curWeight;
	}
	spectralCentroid /= spectralWeights;
	spectralCentroid /= n;

	var noisiness = 0;
	for(var i = 0; i < n; i++) {
		var curWeight = this.audio.fft.spectrum[i];
		var curDiff = curWeight - spectralWeights;
		noisiness += curDiff * curDiff;
	}
	noisiness = Math.sqrt(noisiness / n);
	noisiness /= n;

	var rect = this.rects[this.curRect];
	// rect.scale.y = 60000 * noisiness; // cur value here
	rect.scale.y = 600 * spectralCentroid; // cur value here
	this.curRect++;
	if(this.curRect >= this.rects.length ) {
		this.curRect = 0;
	}
	// console.log(this.curRect + " " + this.rects.length);

	// for ( var i=0; i<this.audio.vu.vu_levels.length; i++ ) {
	// 	var rect = this.rects[i];
	// 	var vu = ( this.audioMode == 'vu' ) ? this.audio.vu.vu_levels[i] : audio.fft.spectrum[i*4] * 20.0;

	// 	// if ( displayFFT )
	// 	// 	vu = audio.fft.spectrum[i*4] * 10.0;
	// 	vu = Math.max( .01, vu );
	// 	rect.scale.y = 250.0 * vu;
	// }
}