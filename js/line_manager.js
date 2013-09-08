LineManager = function( maxLines ) {

	var shape = new THREE.Shape();
	this.maxLines = maxLines;
	
	for ( var i=0; i<maxLines; i++ ) {
		// shape.moveTo( utils.random(WIDTH), utils.random(-HEIGHT*.5,HEIGHT*.5) );
		// shape.lineTo( utils.random(WIDTH), utils.random(-HEIGHT*.5,HEIGHT*.5) );
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, 0 );
	}

	var geometry = shape.createPointsGeometry();
	geometry.dynamic = true;
	// console.log( "geometry created with " + geometry.vertices.length + " vertices" );
	this.mesh = new THREE.Line( geometry, new THREE.LineBasicMaterial({color:0xFFFFFF, linewidth:1}), THREE.LinePieces );

	this.indexOffset = 0;
}

LineManager.prototype.addLine = function( x1, y1, x2, y2 ) {

	if ( this.indexOffset == this.maxLines )
		return;

	var verts = this.mesh.geometry.vertices;

	verts[this.indexOffset*2+0].set( x1, y1, 0 );
	verts[this.indexOffset*2+1].set( x2, y2, 0 );

	this.indexOffset++;
}

LineManager.prototype.clear = function() {
	var verts = this.mesh.geometry.vertices;
	for ( v in verts ) {
		var vert = verts[v];
		vert.set( 0, 0, 0 );
	}
	this.indexOffset = 0;
	this.mesh.verticesNeedUpdate = true;
	// this.mesh.__dirtyVertices = true;
}

LineManager.prototype.update = function() {

	// console.log( 'update: ' + this.indexOffset );

	var verts = this.mesh.geometry.vertices;
	for ( var i=this.indexOffset; i<this.maxLines; i++ ) {
		verts[i*2+0].set( 0, 0, 0 );
		verts[i*2+1].set( 0, 0, 0 );
	}

	this.mesh.verticesNeedUpdate = true;
	// this.mesh.__dirtyVertices = true;
}