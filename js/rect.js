var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
var planeMaterial = new THREE.MeshBasicMaterial( {color:0xffffff, transparent:true} );

var squareShape = new THREE.Shape();
squareShape.moveTo( -.5, -.5 );
squareShape.lineTo( -.5, .5 );
squareShape.lineTo( .5, .5 );
squareShape.lineTo( .5, -.5 );
squareShape.lineTo( -.5, -.5 );
var wirePoints = squareShape.createPointsGeometry();
var wireMaterial = new THREE.LineBasicMaterial( {color:0xffffff, linewidth:10} );

Rect = function( x, y, width, height, filled, thickness ) {

	if ( thickness == undefined ) thickness = 10;

	this.node = new THREE.Object3D();
	// this.node.scale.x = width;
	// this.node.scale.y = height;
	this.node.position.x = x;
	this.node.position.y = y;
	this.rotationX = 0;
	this.rotationZ = 0;

	this.velX = 0;
	this.velY = 0;

	// create a filled plane
	this.plane = new THREE.Mesh( planeGeometry, planeMaterial );
	this.plane.name = "plane";
	this.node.add( this.plane );
	// create planes for either side so that it wraps around
	this.planeL = new THREE.Mesh( planeGeometry, planeMaterial );
	this.planeL.position.x = -WIDTH;
	this.planeL.name = "planeL";
	this.node.add( this.planeL );
	this.planeR = new THREE.Mesh( planeGeometry, planeMaterial );
	this.planeR.position.x = WIDTH;
	this.planeR.name = "planeR";
	this.node.add( this.planeR );
	
	this.prects = new Array();
	this.prect = new PRect( 0, 0, width, height, thickness );
	this.prects.push( this.prect );
	this.node.add( this.prect.mesh );
	var prectL = this.prect.mesh.clone();
	prectL.position.x = -WIDTH;
	this.node.add( prectL );
	var prectR = this.prect.mesh.clone();
	prectR.position.x = WIDTH;
	this.node.add( prectR );

	// this.prects.push( prectL );
	// this.prects.push( prectR );

	this.width = width;
	this.height = height;

	for ( var c in this.node.children ) {
		var child = this.node.children[c];
		if ( child.name == "prect" ) {

		} else {
			child.scale.x = width;
			child.scale.y = height;
		}
	}

	// this.isFilled = filled;
	this.setFill( filled );
}

Rect.prototype.update = function() {
	// console.log( "update: " + this.node.uuid );
	for ( pr in this.prects )
		this.prects[pr].update();
}

Rect.prototype.getRotationX = function() {
	return this.rotationX;
}

Rect.prototype.setRotationX = function( rotation ) {
	for ( var c in this.node.children )
		this.node.children[c].rotation.x = rotation;
	this.rotationX = rotation;
}

Rect.prototype.getRotationZ = function() {
	return this.rotation;
}

Rect.prototype.setRotationZ = function( rotation ) {
	for ( var c in this.node.children )
		this.node.children[c].rotation.z = rotation;
	this.rotationZ = rotation;
}

Rect.prototype.getWidth = function() {
	return this.width;
	// return this.plane.scale.x;
}

Rect.prototype.setThickness = function( thickness ) {
	for ( var pr in this.prects )
		this.prects[pr].setThickness( thickness );
}

Rect.prototype.setWidth = function( width ) {
	for ( var c in this.node.children ) {
		if ( this.node.children[c].name == "prect" ) {

		} else {
			this.node.children[c].scale.x = width;
		}
	}
	for ( pr in this.prects ) {
		this.prects[pr].setWidth( width );
	}
	this.width = width;
}

Rect.prototype.getHeight = function() {
	// return this.plane.scale.y;
	return this.height;
}

Rect.prototype.setHeight = function( height ) {
	for ( var c in this.node.children ) {
		if ( this.node.children[c].name == "prect" ) {
		} else {
			this.node.children[c].scale.y = height;
		}
	}
	for ( pr in this.prects ) {
		this.prects[pr].setHeight( height );
	}
	this.height = height;
}

Rect.prototype.getTop = function() {
	return this.node.position.y + this.getHeight()/2;
}

Rect.prototype.getBottom = function() {
	return this.node.position.y - this.getHeight()/2;
}

Rect.prototype.splitNum = function( num, margin ) {
	num = Math.floor( num );
	
	// split the rectangle into an arbitrary number of new rectangles
	var destWidth = ( this.getWidth() - ( margin * (num-1) ) ) / num;
	// var destWidth = this.getWidth() / num;
	// temp node
	var tempNode = new THREE.Object3D({name:"tempSplitNode"});
	tempNode.position = this.node.position;
	this.node.parent.add( tempNode );
	// find the left edge and start from there
	var leftEdge = this.node.position.x - this.getWidth()/2;

	var callback = function() {
		var parent = this.node.parent;
		parent.parent.add( this.node );
		if ( parent.children.length == 0 ) {
			parent.parent.remove( parent );
		}
		this.node.position.x += parent.position.x;
		this.node.position.y += parent.position.y;
	}
	var speed = 200;
	var returnRects = new Array();
	for ( var i=0; i<num; i++ ) {

		var xpos = (leftEdge + destWidth/2) - tempNode.position.x + (destWidth+margin) * i;
		var rect = new Rect( 0, 0, this.getWidth(), this.getHeight() );
		rect.setFill( this.isFilled ).animate( xpos, undefined, destWidth, undefined, speed, callback );
		tempNode.add( rect.node );
		returnRects.push( rect );
	}

	return returnRects;

}

Rect.prototype.split = function( margin ) {
	// split the rectangle into 2 new rectangles
	var destWidth = ( this.getWidth() / 2.0 ) - ( margin / 2.0 );
	// var rect1 = new Rect( this.node.position.x, this.node.position.y, this.getWidth(), this.getHeight() );
	// var rect2 = new Rect( this.node.position.x, this.node.position.y, this.getWidth(), this.getHeight() );
	var rect1 = new Rect( 0, 0, this.getWidth(), this.getHeight() );
	var rect2 = new Rect( 0, 0, this.getWidth(), this.getHeight() );

	// find the left edge and right edge of this rect
	var leftEdge = this.node.position.x - this.getWidth()/2;
	var rightEdge = this.node.position.x + this.getWidth()/2;
	// get the position for the new rects
	var leftX = leftEdge + destWidth/2;
	var rightX = rightEdge - destWidth/2;

	var tempNode = new THREE.Object3D();
	tempNode.name = "tempSplitNode";
	tempNode.position = this.node.position;
	tempNode.add( rect1.node );
	tempNode.add( rect2.node );
	this.node.parent.add( tempNode );
	leftX -= tempNode.position.x;
	rightX -= tempNode.position.x;

	// callback for completion of split animation removes them from the temporary node
	var callback = function() {
		var parent = this.node.parent;
		parent.parent.add( this.node );
		if ( parent.children.length == 0 ) {
			parent.parent.remove( parent );
		}
		this.node.position.x += parent.position.x;
		this.node.position.y += parent.position.y;
	}

	var speed = 200;
	rect1.setFill( this.isFilled ).animate( leftX, undefined, destWidth, undefined, speed, callback );
	rect2.setFill( this.isFilled ).animate( rightX, undefined, destWidth, undefined, speed, callback );

	return [ rect1, rect2 ];
}

Rect.prototype.extend = function( height, direction, time, delay ) {
	delay = (delay==undefined)?0:delay;

	// extend the rectangle in one direction, maintaining the edge in the opposite direction
	var bottomEdge = this.node.position.y - ( this.getHeight()/2 * direction );
	var y = bottomEdge + ( height/2 * direction );
	this.animate( undefined, y, undefined, height, time, null, delay );
}

Rect.prototype.collapseCenter = function( height ) {
	// collapse the rect to given height in the vertical center
	this.animate( undefined, 0, this.getWidth(), height, 250 );
}

Rect.prototype.animate = function( x, y, width, height, time, callback, delay ) {
	
	delay = (delay==undefined)?0:delay;
	
	var tweenObj = {
		rect: this,
		node: this.node,
		prects: this.prects,
		x: x==undefined?undefined:this.node.position.x,
		y: y==undefined?undefined:this.node.position.y,
		width: width==undefined?undefined:this.getWidth(),
		height: height==undefined?undefined:this.getHeight()
	};


	if ( callback == undefined )
		callback = function() {}

	this.tween = new TWEEN.Tween( tweenObj )
		.to( {x:x, y:y, width:width, height:height}, time )
		.easing( TWEEN.Easing.Quadratic.InOut )
		.delay( delay )
		.onUpdate(function(){
			// console.log( this.x );
			if ( this.x != undefined )
				this.node.position.x = this.x;
			if ( this.y != undefined )
				this.node.position.y = this.y;
			if ( this.width != undefined )
				this.rect.width = this.width;
			if ( this.height != undefined )
				this.rect.height = this.height;
			for ( var c in this.node.children ) {
				var child = this.node.children[c];
				if ( child.name == "prect" ) {

				} else {
					if ( this.width != undefined )
						child.scale.x = this.width;
					if ( this.height != undefined )
						child.scale.y = this.height;
				}
			}

			for ( pr in this.prects ) {
				if ( this.width != undefined )
					this.prects[pr].setWidth( this.width );
				if ( this.height != undefined ) 
					this.prects[pr].setHeight( this.height );
				if ( this.prects[pr].geoNeedsUpdate )
					this.prects[pr].updateGeometry();
			}
		})
		.onComplete(callback)
		.start();
}

Rect.prototype.setFill = function( filled ) {
	if ( filled ) {
		this.isFilled = true;
		// this.wireframe.visible = this.wireframeL.visible = this.wireframeR.visible = false;
		this.plane.visible = this.planeL.visible = this.planeR.visible = true;
	}
	else {
		this.isFilled = false;
		// this.wireframe.visible = this.wireframeL.visible = this.wireframeR.visible = true;
		this.plane.visible = this.planeL.visible = this.planeR.visible = false;
	}

	return this;
}