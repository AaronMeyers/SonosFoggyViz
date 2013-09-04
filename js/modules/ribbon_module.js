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
		var width = window.innerWidth/numRibbons;
		ribbon.node.position.x = i * width;// + width*.5;
		
		this.ribbons.push( ribbon );
		this.node.add( ribbon.node );
	}
	this.lines = new Horizontals( 20 );
	this.node.add( this.lines.node );
	
}

RibbonModule.prototype.key = function( key ) {
	if ( key == 'A' ) {
		for ( var r in this.ribbons ) {
			this.ribbons[r].throttle( 30, 200, 500 );
			this.strobe( 500 );
		}
	}
	if ( key == 'Q' ) {
		for ( var r in this.ribbons )
			this.ribbons[r].jumble( 500 );
		this.strobe( 500 );
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


RibbonModule.prototype.update = function() {
	// console.log( mouseX, mouseY );

	// this.ribbon.update();
	for ( var r in this.ribbons ) {
		this.ribbons[r].update();
	}
	this.lines.update();
}