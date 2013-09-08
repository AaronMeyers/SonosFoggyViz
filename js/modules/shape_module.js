// Plan: control points start around a square and create a spline that creates a ribbon mesh
/*
 *	steps:
 *	1. create control points
 *	2. create closed ribbon from control points
 *	3. play with ways of moving around control points
 *	4. see if its feasable to morph from a perfect square to a wiggly shape
 */




ShapeModule = function( audio, scene, guiFolder ) {

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

ShapeModule.prototype.on = function() {
	this.scene.add( this.node );
}

ShapeModule.prototype.off = function() {
	this.scene.remove( this.node );
}

ShapeModule.prototype.setVertsFromSpline = function( verts, spline ) {

	var positions = new Array();
	for ( var i=0; i<this.length; i++) {
		var norm = i / (this.length-1);
		var pt = spline.getPoint( norm );
		var pos = new THREE.Vector3( pt.x, pt.y, 0 );
		positions.push( pos );
		console.log( pt );
	}

	var thickness = 20;

	for ( var i=0; i<this.length; i++ ) {
		var v1 = verts[i*2+0];
		var v2 = verts[i*2+1];
		// console.log( i + '/' + this.length );
		var secondIndex = (i+1)%(positions.length-1);
		var dir = positions[i].clone().sub( positions[secondIndex] ).normalize();
		if ( i==this.length-1 ) {
			console.log( dir.x + ',' + dir.y );
		}
		v1.x = positions[i].x - (thickness * dir.y);
		v1.y = positions[i].y + (thickness * dir.x);
		v2.x = positions[i].x + (thickness * dir.y);
		v2.y = positions[i].y - (thickness * dir.x);
	}

}


ShapeModule.prototype.init = function() {

	var dim = 900;
	this.rectsPerSide = 30;
	this.length = 4 * this.rectsPerSide + 1;

	var corners = [
		new THREE.Vector3( -dim * .5, dim * .5, 0 ), // upper left
		new THREE.Vector3( dim * .5, dim * .5, 0 ), // upper right
		new THREE.Vector3( dim * .5, -dim * .5, 0 ), // lower right
		new THREE.Vector3( -dim * .5, -dim * .5, 0 )
	];



	this.controlPoints = new Array();
	var numPerSegment = 4; // make sure this is even

	var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10, 1, 1 ), new THREE.MeshBasicMaterial({color:0xFFFFFF}) );
	this.cpNode = new THREE.Object3D();
	// this.cpNode.position.x = WIDTH/2;
	this.node.add( this.cpNode );
	// go through each segemtn and create control points between
	for ( var i=0; i<corners.length; i++ ) {
		var start = corners[i];
		var end = corners[(i+1)%corners.length];

		for ( var j=0; j<numPerSegment; j++ ) {
			var lerpAmt = j / numPerSegment;
			var pt = new THREE.Vector3();
			pt.x = utils.lerp( start.x, end.x, lerpAmt );
			pt.y = utils.lerp( start.y, end.y, lerpAmt );
			var square = mesh.clone();
			square.position.set( pt.x, pt.y, 0 );
			this.cpNode.add( square );
			this.controlPoints.push( pt );
		}
	}
	// offset the control points by half the num per segemtn
	var offsetPart = this.controlPoints.splice(0,numPerSegment/2);
	for ( var i=0; i<offsetPart.length; i++ ) this.controlPoints.push( offsetPart[i] );
	// add the first corner to complete the loop
	this.controlPoints.push( this.controlPoints[0].clone() );

	this.spline = new THREE.Spline( this.controlPoints );
	this.geometry = new THREE.PlaneGeometry( 100, 100, 1, this.length-1 );
	this.material = new THREE.MeshBasicMaterial({color:0xFFFFFF,wireframe:true});
	this.mesh = new THREE.Mesh( this.geometry, this.material );
	this.mesh.dynamic = true;

	this.node.add( this.mesh );
	this.node.position.x = WIDTH/2;

	this.setVertsFromSpline( this.mesh.geometry.vertices, this.spline );
	this.mesh.geometry.verticesNeedUpdate = true;
}

ShapeModule.prototype.update = function() {
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

ShapeModule.prototype.key = function( key ) {

}