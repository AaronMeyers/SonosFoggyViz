function RibbonModule( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

RibbonModule.prototype.on = function() {
	this.scene.add( this.node );
}

RibbonModule.prototype.off = function() {
	this.scene.remove( this.node );
}

RibbonModule.prototype.init = function() {

	this.mouseX = 0;
	this.mouseY = 0;
	this.toggled = false;
	this.strobeCounter = 0;


	this.ribbons = new Array();
	var numRibbons = 5;
	for ( var i=0; i<numRibbons; i++ ) {
		var ribbon = new Ribbon();
		var width = WIDTH/numRibbons;
		ribbon.node.position.x = i * width;// + width*.5;
		
		this.ribbons.push( ribbon );
		this.node.add( ribbon.node );
	}
	this.lines = new Horizontals( 20 );
	this.node.add( this.lines.node );

	this.hitCount = 0;
	this.lastHit = new Date().getTime();
	this.hitThreshold = 500;
	this.gui.add( this, 'hitThreshold', 100, 1000 );
	
}


RibbonModule.prototype.update = function() {
	// console.log( mouseX, mouseY );

	if ( this.audio.useAudio ) {

		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 && sinceLastHit > this.hitThreshold ) {
			console.log( 'since last hit: ' + sinceLastHit );
			this.hitCount++;
			this.lastHit = time;

			var option = this.hitCount % 3;
			if ( option==0 )
				this.jumble( 200 );
			if ( option==1 )
				this.strobe( 200 );
			if ( option==2 )
				this.throttle( 30, 200, 500 );
		}
			// console.log( 'do something: ' + this.audio.noisiness );

	}

	// this.ribbon.update();
	for ( var r in this.ribbons ) {
		this.ribbons[r].update();
	}
	this.lines.update();
}


RibbonModule.prototype.jumble = function( speed ) {
	for ( var r in this.ribbons )
		this.ribbons[r].jumble( speed );
}

RibbonModule.prototype.throttle = function( amount, time1, time2 ) {
	for ( var r in this.ribbons ) {
		this.ribbons[r].throttle( amount, time1, time2 );
		// this.strobe( 500 );
	}
}

RibbonModule.prototype.key = function( key ) {
	if ( key == 'A' ) {
		this.throttle( 30, 100, 100 );
	}
	if ( key == 'Q' ) {
		this.jumble();
		// this.strobe( 500 );
	}
	if ( key == 'T' ) {
		this.toggle( !this.toggled );
	}
	if ( key == 'S' ) {
		this.strobe( 200 );
	}
}

RibbonModule.prototype.strobe = function( time ) {
	var tween = new TWEEN.Tween(this)
		.to({}, time)
		.onUpdate(function(){
			// console.log(this);
			if ( ++this.strobeCounter%3 )
				this.toggle(!this.toggled);
		})
		.onComplete(function() {
			this.toggle( false );
			this.strobeCounter = 0;
		})
		.start();

}

RibbonModule.prototype.toggle = function( toggle ) {
	this.toggled = toggle;

	for ( var r in this.ribbons ) {
		var ribbon = this.ribbons[r];
		ribbon.material.color.setRGB( toggle?255:0, toggle?255:0, toggle?255:0 );
		ribbon.node.position.z = toggle?0:10;
	}

	this.lines.lineMaterial.color.setRGB( toggle?0:255, toggle?0:255, toggle?0:255 );
	this.lines.node.position.z = toggle?10:0;
}