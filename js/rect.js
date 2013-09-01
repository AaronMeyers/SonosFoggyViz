var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
var planeMaterial = new THREE.MeshBasicMaterial( {color:0xffffff, transparent:true} );

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
	// create planes for either side so that it wraps around
	this.planeL = new THREE.Mesh( planeGeometry, planeMaterial );
	this.planeL.position.x = -window.innerWidth;
	this.node.add( this.planeL );
	this.planeR = new THREE.Mesh( planeGeometry, planeMaterial );
	this.planeR.position.x = window.innerWidth;
	this.node.add( this.planeR );

	// create a wireframe plane
	this.wireframe = new THREE.Line( wirePoints, wireMaterial );
	this.node.add( this.wireframe );
	// create a wrapping wireframe plane
	this.wireframeL = new THREE.Line( wirePoints, wireMaterial );
	this.wireframeL.position.x = -window.innerWidth;
	this.node.add( this.wireframeL );
	this.wireframeR = new THREE.Line( wirePoints, wireMaterial );
	this.wireframeR.position.x = window.innerWidth;
	this.node.add( this.wireframeR );

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
	// get the position for the new rects
	var leftX = leftEdge + destWidth/2;
	var rightX = rightEdge - destWidth/2;

	var tempNode = new THREE.Object3D();
	tempNode.position = this.node.position;
	tempNode.add( rect1.node );
	tempNode.add( rect2.node );
	this.node.parent.add( tempNode );
	rect1.node.position.x = 0;
	rect2.node.position.x = 0;
	leftX -= tempNode.position.x;
	rightX -= tempNode.position.x;

	// callback for completion of split animation removes them from the temporary node
	var callback = function() {
		var parent = this.node.parent;
		parent.parent.add( this.node );
		if ( parent.children.length == 0 )
			parent.parent.remove( this.node.parent );
		this.node.position.x += parent.position.x;
	}

	var speed = 200;
	rect1.setFill( this.isFilled ).animate( leftX, 0, destWidth, 100, speed, callback );
	rect2.setFill( this.isFilled ).animate( rightX, 0, destWidth, 100, speed, callback );

	return [ rect1, rect2 ];
}

Rect.prototype.animate = function( x, y, width, height, time, callback ) {
	// return;
	var tweenObj = {
		node: this.node,
		x: this.node.position.x,
		y: this.node.position.y,
		width: this.getWidth(),
		height: this.getHeight()
	};

	if ( callback == undefined )
		callback = function() {}

	this.tween = new TWEEN.Tween( tweenObj )
		.to( {x:x, y:y, width:width, height:height}, time )
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate(function(){
			this.node.position.x = this.x;
			this.node.position.y = this.y;
			for ( var c in this.node.children ) {
				var child = this.node.children[c];
				child.scale.x = this.width;
				child.scale.y = this.height;
			}
		})
		.onComplete( callback )
		.start();
}

Rect.prototype.setFill = function( filled ) {
	if ( filled ) {
		this.isFilled = true;
		this.wireframe.visible = this.wireframeL.visible = this.wireframeR.visible = false;
		this.plane.visible = this.planeL.visible = this.planeR.visible = true;
	}
	else {
		this.isFilled = false;
		this.wireframe.visible = this.wireframeL.visible = this.wireframeR.visible = true;
		this.plane.visible = this.planeL.visible = this.planeR.visible = false;
	}

	return this;
}