SplitterModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

SplitterModule.prototype.on = function() {
	this.scene.add( this.node );
}

SplitterModule.prototype.off = function() {
	this.scene.remove( this.node );
}

SplitterModule.prototype.init = function() {

	this.filled = false;
	this.rects = new Array();

	var startRect = new Rect( WIDTH/2, 0, WIDTH - 10, 100, this.filled );
	this.node.add( startRect.node );
	this.rects.push( startRect );

	this.scrollSpeed = 1;
	this.scrollMultiplier = 1;
	this.gui.add( this, 'scrollSpeed', -50, 50 );
	this.node.name = "SplitterModuleNode";
}

SplitterModule.prototype.update = function() {

	for ( var r in this.rects ) {
		var rect = this.rects[r];

		rect.update();
	}

	for ( var n in this.node.children ) {
		var node = this.node.children[n];
		node.position.x -= this.scrollSpeed * this.scrollMultiplier;
		if ( node.position.x > WIDTH )
			node.position.x -= WIDTH;
		else if ( node.position.x < 0 )
			node.position.x += WIDTH;
	}

	if ( audio.kick_det.isKick() ) {
		this.flashFill();
	}
	if ( audio.beat )
		this.splitRandomRect();

}

SplitterModule.prototype.setFill = function( fill ) {
	this.filled = fill;
	for ( var r in this.rects ) {
		this.rects[r].setFill( this.filled );
	}
}

SplitterModule.prototype.flashFill = function() {
	this.setFill( true );
	var tween = new TWEEN.Tween({module:this, material:planeMaterial, opacity:planeMaterial.opacity})
		.to({opacity:0}, 250 )
		.onUpdate( function() {
			this.material.opacity = this.opacity;
		})
		.onComplete( function() {
			// after we've faded out the fill, turn the fill off and set the material back to being fully opaque
			this.module.setFill( false );
			this.material.opacity = 1.0;
		})
		.start();
}

SplitterModule.prototype.convergeAll = function() {

	// create an object to pair everything to
	var obj = new THREE.Object3D();
	obj.name = "convergenceNode";
	// kill all tweens
	var tweens = TWEEN.getAll();
	while ( tweens.length > 0 ) {
		var tween = tweens[0].stop();
	}
	// iterate through children and attach them to the new obj
	while ( this.node.children.length > 0 ) {
		var child = this.node.children[0];
		if ( child.name == "tempSplitNode" ) {
			// splitting rects need to be unattached
			while ( child.children.length > 0 ) {
				var rect = child.children[0];
				rect.position.x += child.position.x;
				rect.position.y += child.position.y;
				obj.add( rect );
			}
			this.node.remove( child );
		}
		else
		{
			this.node.remove( child );
			obj.add( child );
		}
	}

	this.node.add( obj );

	// now we can animate them all back to center
	var keeper = undefined
	while ( this.rects.length > 0 ) {

		var keeperCallback = function() {
			// we'll only add one rect back to the main node
			var moduleNode = this.node.parent.parent;
			var tempNode = this.node.parent;
			moduleNode.add( this.node );
			moduleNode.remove( tempNode );
		}
		var rect = this.rects.splice( 0, 1 );
		rect[0].animate( WIDTH/2, 0, WIDTH - 10, 100, 500, (this.rects.length==0)?keeperCallback:undefined );
		if ( this.rects.length == 0 ) {
			keeper = rect[0];
		}
	}

	this.rects.push( keeper );

}

SplitterModule.prototype.splitRandomRect = function() {
	var rect = utils.random(this.rects);
	if ( TWEEN.getAll().indexOf( rect.tween ) > -1 || rect.getWidth() < 20 ) {
		console.log( 'random rect was tweening or was too small' );
		return;
	}
	this.splitRect( rect );
}

SplitterModule.prototype.splitAllRects = function( num ) {

	num = (num==undefined)?2:num;

	var rects = this.rects.slice(0);
	for ( var r in rects ) {
		var rect = rects[r];
		if ( TWEEN.getAll().indexOf( rect.tween ) > -1 || rect.getWidth() < 20 )
			continue;

		this.splitRect( rect, num );
	}
}

SplitterModule.prototype.splitRect = function ( rect, num ) {

	// var newRects = (num==2) ? rect.split( 10 ) : rect.splitNum( num, 10 );
	var newRects = rect.splitNum( num, 10 );
	for ( var r in newRects ) {
		this.rects.push( newRects[r] );
	}
	// get rid of the rect we just split
	var removalIndex = this.rects.indexOf( rect );
	this.rects.splice( removalIndex, 1 );
	// take it out of the scene graph too
	rect.node.parent.remove( rect.node );
}

SplitterModule.prototype.key = function( key ) {

	// things to add

	if ( key == 'E' ) {
		for ( var r in this.rects ) {
			var rect = this.rects[r];
			rect.extend( utils.random( 200, 400 ), utils.randomSign(), r * (250/this.rects.length) );
		}
	}
	if ( key == 'R' ) {
		for ( var r in this.rects ) {
			var rect = this.rects[r];
			rect.collapseCenter( 100 );
		}
	}

	if ( key == 'T' ) {
		this.splitAllRects(3);
	}

	if ( key == 'F' ) {
		this.convergeAll();
	}

	if ( key == 'A' ) {
		var tween = new TWEEN.Tween(this)
			.to({scrollMultiplier:Math.abs(100/this.scrollSpeed)}, 100) // scroll multiplier always jumps speed up to 100
			.start();

		var tweenBack = new TWEEN.Tween(this)
			.to({scrollMultiplier:1}, 500 )
			.easing( TWEEN.Easing.Quadratic.InOut );

		tween.chain(tweenBack);
	}

	if ( key == 'Q' ) {
		this.flashFill();
	}

	// if ( key == 'F' ) {
	// 	// toggle fill mode on rects
	// 	this.setFill( !this.filled );
	// }

	if ( key == 'S' ) {
		this.splitRandomRect();
	}

	if ( key == 'D' ) {
		this.splitAllRects();
	}
}