function Horizontals( num ) {
	this.lines = new Array();
	this.node = new THREE.Object3D();
	this.speed = .5;
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