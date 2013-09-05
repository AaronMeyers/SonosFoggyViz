function Horizontals( num ) {
	this.lines = new Array();
	this.node = new THREE.Object3D();
	this.baseSpeed = .5;
	this.speed = this.baseSpeed;
	this.lineWidth = 10;


	var lineShape = new THREE.Shape();
	lineShape.moveTo( -WIDTH, 0 );
	lineShape.lineTo( WIDTH, 0 );
	this.lineGeom = lineShape.createPointsGeometry();
	this.lineMaterial = new THREE.LineBasicMaterial({color:0xFFFFFF, linewidth:this.lineWidth});

	// make a bunch of lines
	for ( var i=0; i<num; i++ ) {
		var line = new THREE.Line( this.lineGeom, this.lineMaterial );
		line.position.y = utils.map( i, 0, num-1, -HEIGHT * .5, HEIGHT * .5 );
		this.node.add( line );
		this.lines.push( line );
	}
}

Horizontals.prototype.throttle = function(amount, time1, time2) {
	var tween = new TWEEN.Tween(this)
		.to({speed:amount}, time1 )
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({speed:this.baseSpeed}, time2 )
		.easing(TWEEN.Easing.Quadratic.InOut)

	tween.chain(tweenBack);
}

Horizontals.prototype.setWidth = function( width ) {
	
	this.lineWidth = width;
	this.lineMaterial.linewidth = this.lineWidth;
	// for ( l in this.lines ) {
	// 	this.lines[l].material.linewidth = width;
	// }
}

Horizontals.prototype.update = function() {

	for ( l in this.lines ) {
		var line = this.lines[l];
		line.position.y += this.speed;

		if ( line.position.y - this.lineWidth/2 > HEIGHT * .5 )
			line.position.y -= HEIGHT;
		// if ( line.position.y < HEIGHT * -.5 )
		// 	line.position.y += HEIGHT;
	}

}