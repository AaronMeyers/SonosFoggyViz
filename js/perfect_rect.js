PRect = function( x, y, width, height, thickness ) {

	this.thickness = thickness;
	this.width = width;
	this.height = height;
	this.geoNeedsUpdate = false;

	// left side
	var leftGeom = new THREE.PlaneGeometry( thickness, height + thickness, 1, 1 );
	leftGeom.offsetVerts( -width*.5, 0 );
	// top side
	var topGeom = new THREE.PlaneGeometry( width + thickness, thickness, 1, 1 );
	topGeom.offsetVerts( 0, height*.5 );
	// right side
	var rightGeom = new THREE.PlaneGeometry( thickness, height + thickness, 1, 1 );
	rightGeom.offsetVerts( width*.5, 0 );
	// bottom side
	var bottomGeom = new THREE.PlaneGeometry( width + thickness, thickness, 1, 1 );
	bottomGeom.offsetVerts( 0, -height*.5 );

	THREE.GeometryUtils.merge( leftGeom, topGeom );
	THREE.GeometryUtils.merge( leftGeom, rightGeom );
	THREE.GeometryUtils.merge( leftGeom, bottomGeom );
	this.mesh = new THREE.Mesh( leftGeom, new THREE.MeshBasicMaterial({color:0xFFFFFF}) );
	this.mesh.geometry.dynamic = true;
	this.mesh.position.set( x, y, 0 );
	this.mesh.name = "prect";

}

THREE.Geometry.prototype.offsetVerts = function( x, y ) {

	for ( v in this.vertices ) {
		this.vertices[v].x += x;
		this.vertices[v].y += y;
	}
}

PRect.prototype.makeBox = function( verts, offset, xCenter, yCenter, width, height ) {
	// vert order goes upper left, upper right, lower left, lower right
	verts[offset+0].set( xCenter - width*.5, yCenter + height*.5, 0 );
	verts[offset+1].set( xCenter + width*.5, yCenter + height*.5, 0 );
	verts[offset+2].set( xCenter - width*.5, yCenter - height*.5, 0 );
	verts[offset+3].set( xCenter + width*.5, yCenter - height*.5, 0 );
}

PRect.prototype.updateGeometry = function() {

	var indexOffset = 0;
	var verts = this.mesh.geometry.vertices;
	// update left side
	this.makeBox( verts, indexOffset, -this.width*.5, 0, this.thickness, this.height+this.thickness );
	indexOffset+=4;
	// update the top side
	this.makeBox( verts, indexOffset, 0, this.height*.5, this.width+this.thickness, this.thickness );
	indexOffset+=4;
	// update right side
	this.makeBox( verts, indexOffset, this.width*.5, 0, this.thickness, this.height+this.thickness );
	indexOffset+=4;
	// updaate the bottom side
	this.makeBox( verts, indexOffset, 0, -this.height*.5, this.width+this.thickness, this.thickness );



	this.mesh.geometry.verticesNeedUpdate = true;
	this.geoNeedsUpdate = false;
}

PRect.prototype.setThickness = function( thickness ) {
	if ( thickness == this.thickness )
		return;

	this.thickness = thickness;
	this.geoNeedsUpdate = true;
}

PRect.prototype.setWidth = function( width ) {
	if ( this.width == width )
		return;

	this.width = width;
	this.geoNeedsUpdate = true;
}

PRect.prototype.setHeight = function( height ) {
	if ( this.height == height )
		return;
	this.height = height;
	this.geoNeedsUpdate = true;
}

PRect.prototype.update = function() {
	if ( this.geoNeedsUpdate )
		this.updateGeometry();
}