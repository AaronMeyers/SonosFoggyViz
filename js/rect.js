var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
var planeMaterial = new THREE.MeshBasicMaterial( {color:0xffffff} );

var squareShape = new THREE.Shape();
squareShape.moveTo( -.5, -.5 );
squareShape.lineTo( -.5, .5 );
squareShape.lineTo( .5, .5 );
squareShape.lineTo( .5, -.5 );
squareShape.lineTo( -.5, -.5 );
var wirePoints = squareShape.createPointsGeometry();
var wireMaterial = new THREE.LineBasicMaterial( {color:0xffffff, linewidth:2} );

Rect = function( x, y, width, height, filled ) {

	this.node = new THREE.Object3D();
	// this.node.scale.x = width;
	// this.node.scale.y = height;
	this.node.position.x = x;
	this.node.position.y = y;

	// create a filled plane
	this.plane = new THREE.Mesh( planeGeometry, planeMaterial );
	this.node.add( this.plane );
	// create a wrapping filled plane
	this.wrapPlane = new THREE.Mesh( planeGeometry, planeMaterial );
	this.wrapPlane.position.x = -window.innerWidth;
	this.node.add( this.wrapPlane );

	// create a wireframe plane
	this.wireframe = new THREE.Line( wirePoints, wireMaterial );
	this.node.add( this.wireframe );
	// create a wrapping wireframe plane
	this.wrapWireframe = new THREE.Line( wirePoints, wireMaterial );
	this.wrapWireframe.position.x = -window.innerWidth;
	this.node.add( this.wrapWireframe );

	for ( var c in this.node.children ) {
		var child = this.node.children[c];
		child.scale.x = width;
		child.scale.y = height;
	}

	// this.isFilled = filled;
	this.setFill( filled );
}

Rect.prototype.update = function() {

}

Rect.prototype.getWidth = function() {
	return this.plane.scale.x;
}

Rect.prototype.getHeight = function() {
	return this.plane.scale.y;
}

Rect.prototype.split = function( margin ) {
	// split the rectangle into 2 new rectangles

	var destWidth = ( this.getWidth() / 2.0 ) - ( margin / 2.0 );
	var rect1 = new Rect( this.node.position.x, this.node.position.y, this.getWidth(), this.getHeight() );
	var rect2 = new Rect( this.node.position.x, this.node.position.y, this.getWidth(), this.getHeight() );

	// find the left edge and right edge of this rect
	var leftEdge = this.node.position.x - this.getWidth()/2;
	var rightEdge = this.node.position.x + this.getWidth()/2;

	var leftX = leftEdge + destWidth/2;
	var rightX = rightEdge - destWidth/2;


	rect1.setFill( this.isFilled ).animate( leftX, 0, destWidth, 100 );
	rect2.setFill( this.isFilled ).animate( rightX, 0, destWidth, 100 );

	return [ rect1, rect2 ];
}

Rect.prototype.animate = function( x, y, width, height ) {
	// return;
	var tweenObj = {
		node: this.node,
		x: this.node.position.x,
		y: this.node.position.y,
		width: this.getWidth(),
		height: this.getHeight()
	};

	this.tween = new TWEEN.Tween( tweenObj )
		.to( {x:x, y:y, width:width, height:height}, 200 )
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate(function(){
			this.node.position.x = this.x;
			this.node.position.y = this.y;
			// this.node.scale.x = this.width;
			// this.node.scale.y = this.height;
			for ( var c in this.node.children ) {
				var child = this.node.children[c];
				child.scale.x = this.width;
				child.scale.y = this.height;
			}
		})
		.start();
}

Rect.prototype.setFill = function( filled ) {
	if ( filled ) {
		this.isFilled = true;
		this.wireframe.visible = this.wrapWireframe.visible = false;
		this.plane.visible = this.wrapPlane.visible = true;
	}
	else {
		this.isFilled = false;
		this.wireframe.visible = this.wrapWireframe.visible = true;
		this.plane.visible = this.wrapPlane.visible = false;
	}

	return this;
}