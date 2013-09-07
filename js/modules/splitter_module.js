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
	this.margin = 40;
	this.rectHeight = 100;

	var startRect = new Rect( WIDTH/2, 0, WIDTH - this.margin, this.rectHeight, this.filled );
	this.node.add( startRect.node );
	this.rects.push( startRect );

	this.scrollSpeed = 1;
	this.scrollMultiplier = 1;
	this.gui.add( this, 'scrollSpeed', -50, 50 ).listen();
	this.node.name = "SplitterModuleNode";

	this.hitCount = 0;
	this.lastHit = new Date().getTime();
	this.hitThreshold = 500;
	this.gui.add( this, 'hitThreshold', 100, 1000 );
	this.minWidth = this.margin * 2;
	this.extended = false;
}

SplitterModule.prototype.update = function() {

	if ( this.audio.useAudio ) {

		this.scrollSpeed = utils.sign( this.scrollSpeed ) * this.audio.noisiness * .1;


		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				this.hitCount++;
				this.lastHit = time;

				if ( this.hitCount>16 && this.extended ) {
					this.convergeAll();
					this.hitCount = 0;
				} else {

					// var option = this.hitCount % 4;
					var option = Math.floor( utils.random( 3 ) );
					if ( option==0 ) {
						// console.log( '0 split' );
						var num = this.splitAllRects( utils.random( 2, 4 ) );
						if ( num==0 ) { // if no rects were split, either throttle if extended or extend
							if ( this.extended )
								this.throttle();
							else
								this.extendAllRects();
						}
					}
					if ( option==1 ) {
						// console.log( '1 extend' );	
						if ( this.extended )
							this.collapseAllRects();
						else
							this.extendAllRects();
					}
					if ( option==2 ) {
						this.throttle();
					}
				}
			}
		}
		
		if ( audio.kick_det.isKick() ) {
			this.flashFill();
		}
		// this.lines.setWidth( audio.noisiness * .25 );
	}



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

	// if ( audio.beat )
	// 	this.splitRandomRect();

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
		rect[0].animate( WIDTH/2, 0, WIDTH - this.margin, this.rectHeight, 500, (this.rects.length==0)?keeperCallback:undefined );
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

SplitterModule.prototype.extendAllRects = function() {
	for ( var r in this.rects ) {
		var rect = this.rects[r];
		var dir = utils.randomSign();
		var edge = dir > 0 ? rect.getBottom() : rect.getTop();
		var height = (HEIGHT/2-this.margin*dir) - edge;
		if ( Math.floor(utils.random(2))==1 )
			height *= .5;
		rect.extend( height, dir, 200 );
		// rect.extend( utils.random( 200, 400 ), utils.randomSign(), r * (250/this.rects.length) ); // randomly staggers the animation
		// rect.extend( utils.random( 200, 400 ), utils.randomSign(), 200 );
	}
	this.extended = true;
}

SplitterModule.prototype.collapseAllRects = function() {
	for ( var r in this.rects ) {
		var rect = this.rects[r];
		rect.collapseCenter( this.rectHeight );
	}
	this.extended = false;
}

SplitterModule.prototype.splitAllRects = function( num ) {

	num = (num==undefined)?2:num;

	var rects = this.rects.slice(0);
	var numRectsSplit = 0;
	for ( var r in rects ) {
		var rect = rects[r];
		if ( TWEEN.getAll().indexOf( rect.tween ) > -1 || rect.getWidth() < this.minWidth )
			continue;

		this.splitRect( rect, num );
		numRectsSplit++;
	}

	return numRectsSplit;
}

SplitterModule.prototype.throttle = function() {

	this.scrollSpeed *= utils.randomSign();

	var tween = new TWEEN.Tween(this)
		.to({scrollMultiplier:Math.abs(100/this.scrollSpeed)}, 100) // scroll multiplier always jumps speed up to 100
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({scrollMultiplier:1}, 500 )
		.easing( TWEEN.Easing.Quadratic.InOut );

	tween.chain(tweenBack);
}

SplitterModule.prototype.splitRect = function ( rect, num ) {

	// var newRects = (num==2) ? rect.split( 10 ) : rect.splitNum( num, 10 );
	var newRects = rect.splitNum( num, this.margin );
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
		this.extendAllRects();
	}
	if ( key == 'R' ) {
		this.collapseAllRects();
	}

	if ( key == 'T' ) {
		this.splitAllRects(3);
	}

	if ( key == 'F' ) {
		this.convergeAll();
	}

	if ( key == 'A' ) {
		this.throttle();
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