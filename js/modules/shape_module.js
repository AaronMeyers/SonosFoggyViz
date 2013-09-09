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
	this.hitThreshold = 1000;
	this.gui.add( this, 'hitThreshold', 100, 2000 );

	this.init();
}

ShapeModule.prototype.on = function() {
	this.scene.add( this.node );
}

ShapeModule.prototype.off = function() {
	this.scene.remove( this.node );
}

ShapeModule.prototype.init = function() {

	this.dim = 600;
	this.rectsPerSide = 50;
	this.length = 4 * this.rectsPerSide;



	this.baseThickness = 20;
	this.thicknessMultiplier = 1;
	this.gui.add( this, 'baseThickness', 10, 100 ).listen();

	this.sineSeed = 0;
	this.sineSpeed = .25;
	this.gui.add( this, 'sineSpeed' ).listen();
	this.amplitude = 1;
	this.gui.add( this, 'amplitude' ).listen();
	this.amplitudeMultiplier = 1;

	this.rotationSpeed = .001;
	this.rotationSpeedMultiplier = 1;
	this.gui.add( this, 'rotationSpeed' ).listen();

	this.pinchCounter = 0;

	this.controlPoints = new Array();
	this.numPerSegment = 4; // make sure this is even
	this.initControlPoints();

	this.spline = new THREE.Spline( this.controlPoints );
	this.geometry = new THREE.PlaneGeometry( 100, 100, 1, this.length-1 );
	this.material = new THREE.MeshBasicMaterial({color:0xFFFFFF,wireframe:false});
	this.mesh = new THREE.Mesh( this.geometry, this.material );
	this.mesh.dynamic = true;

	// states
	this.apart = 'together';
	this.tweaking = false;
	this.tweakingStep = 8; // number of frames between a tweaking animation
	this.gui.add( this, 'tweakingStep', 1, 16 ).step( 1 );
	this.tweakingCounter = 0;
	this.tweakingFunction = this.pinch;

	this.meshes = [ this.mesh ];
	for ( var i =0; i<7; i++ ) {
		var clone = this.mesh.clone();
		this.meshes.push( clone );
		// clone.position.x = 100 * i;
		this.node.add( clone );
	}

	this.node.add( this.mesh );
	this.node.position.x = WIDTH/2;
	this.hitCounter = 0;

	// this.setVertsForSquare( this.mesh.geometry.vertices, 900, 20 );
	// this.mesh.geometry.verticesNeedUpdate = true;
}

ShapeModule.prototype.initControlPoints = function() {
	
	var corners = [
		new THREE.Vector3( -this.dim * .5, this.dim * .5, 0 ), // upper left
		new THREE.Vector3( this.dim * .5, this.dim * .5, 0 ), // upper right
		new THREE.Vector3( this.dim * .5, -this.dim * .5, 0 ), // lower right
		new THREE.Vector3( -this.dim * .5, -this.dim * .5, 0 )
	];
	
	for ( var i=0; i<corners.length; i++ ) {
		var start = corners[i];
		var end = corners[(i+1)%corners.length];

		for ( var j=0; j<this.numPerSegment; j++ ) {
			var lerpAmt = j / this.numPerSegment;
			var pt = new THREE.Vector3();
			pt.x = utils.lerp( start.x, end.x, lerpAmt );
			pt.y = utils.lerp( start.y, end.y, lerpAmt );
			this.controlPoints.push( pt );
		}
	}
	// offset the control points by half the num per segemtn
	var offsetPart = this.controlPoints.splice(0,this.numPerSegment/2);
	for ( var i=0; i<offsetPart.length; i++ ) this.controlPoints.push( offsetPart[i] );
	// add the first corner to complete the loop
	this.controlPoints.push( this.controlPoints[0] );
};

ShapeModule.prototype.update = function() {
	if ( this.audio.useAudio ) {

		// this.thicknessMultiplier = utils.cmap( this.audio.noiseAvg, 0, 80, 1, 5 );
		this.amplitudeMultiplier = utils.cmap( this.audio.noiseAvg, 2, 80, 0, 30 );

		var time = new Date().getTime();
		var sinceLastHit = time - this.lastHit;

		// if ( !this.tweaking && this.audio.noisiness / this.audio.noiseAvg >= 1.5 && this.audio.noiseHitsRed==1 && sinceLastHit > 500 )
		// 	this.pinchRandom();

		var pinched = false;
		if ( sinceLastHit > this.hitThreshold ) {
			if ( this.audio.noiseHitsRed == 1 && this.audio.noisiness / this.audio.noiseAvg >= 1.5 ) {
				this.lastHit = time;
				this.hitCounter++;
				if ( this.hitCounter % 15 == 0 ) {
					this.tweaking = !this.tweaking;
				}

				if ( !this.tweaking ) {
					if ( Math.random() > .5 )
						this.pinchAcross();
					else
						this.pinchAround();
					pinched = true;
				}

				var option = Math.floor( utils.random( 2 ) );
				if ( option==0 ) {
					this.breakApart( Math.random()>.5?'eight':'two' );
					// this.pinch();
				}
				else if ( option==1 ) {
					this.throttleRotation();
				}

			}
		}

		// if ( audio.kick_det.isKick() ) {
		// 	if ( !this.tweaking && !pinched ) {
		// 		if ( Math.random() > .5 )
		// 			this.pinchAcross();
		// 		else
		// 			this.pinchAround();
		// 	}
		// }
	}

	if ( this.tweaking && ++this.tweakingCounter >= this.tweakingStep ) {
		this.tweakingCounter = 0;
		this.tweakingFunction();
	}

	this.sineSeed += this.sineSpeed;
	// this.mesh.rotation.z += this.rotationSpeed;
	for ( var m in this.meshes ) {
		var mesh = this.meshes[m];
		mesh.rotation.z += this.rotationSpeed * this.rotationSpeedMultiplier;
	}

	this.setVertsFromSpline( this.mesh.geometry.vertices, this.spline );
	this.mesh.geometry.verticesNeedUpdate = true;
}

ShapeModule.prototype.breakApart = function( form ) {
	
	if ( form == this.apart ) {
		this.comeTogether();
		return;
	}

	var dist = form=='eight' ? 225 : 500;
	var scale = form=='eight' ? .5 : 1;
	var positions = form=='eight' ? [
		new THREE.Vector3( -dist * 3, dist, 0 ),
		new THREE.Vector3( -dist, dist, 0 ),
		new THREE.Vector3( dist, dist, 0 ),
		new THREE.Vector3( dist * 3, dist, 0 ),
		new THREE.Vector3( dist*3, -dist, 0 ),
		new THREE.Vector3( dist, -dist, 0 ),
		new THREE.Vector3( -dist, -dist, 0 ),
		new THREE.Vector3( -dist*3, -dist, 0 ),
	] : [
		new THREE.Vector3( -dist, 0, 0 ),
		new THREE.Vector3( -dist, 0, 0 ),
		new THREE.Vector3( dist, 0, 0 ),
		new THREE.Vector3( dist, 0, 0 ),
		new THREE.Vector3( dist, 0, 0 ),
		new THREE.Vector3( dist, 0, 0 ),
		new THREE.Vector3( -dist, 0, 0 ),
		new THREE.Vector3( -dist, 0, 0 ),
	];

	for ( var i = 0; i<this.meshes.length; i++ ) {
		var mesh = this.meshes[i];
		var tweenObj = {
			mesh: mesh,
			x: mesh.position.x,
			y: mesh.position.y,
			scale: mesh.scale.x
		}
		console.log( positions[i].x, positions[i].y );
		var tween = new TWEEN.Tween(tweenObj)
			.to({x: positions[i].x,y: positions[i].y, scale:scale}, 400)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function(){
				this.mesh.position.set( this.x, this.y, 0 );
				this.mesh.scale.set(this.scale,this.scale,this.scale);
			})
			.start();
	}

	this.apart = form;
}

ShapeModule.prototype.comeTogether = function() {
	for ( var i=0; i<this.meshes.length; i++ ) {
		var mesh = this.meshes[i];
		var tweenObj = {
			mesh: mesh,
			x: mesh.position.x,
			y: mesh.position.y,
			scale: mesh.scale.x
		}

		var tween = new TWEEN.Tween(tweenObj)
			.to({x:0,y:0,scale:1}, 400)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function(){
				this.mesh.position.set(this.x, this.y, 0 );
				this.mesh.scale.set(this.scale,this.scale,this.scale);
			})
			.start();
	}
	this.apart = false;
}

ShapeModule.prototype.throttleRotation = function() {


	this.rotationSpeed *= utils.randomSign();

	var tween = new TWEEN.Tween(this)
		.to({rotationSpeedMultiplier:100},200)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.start();

	var tweenBack = new TWEEN.Tween(this)
		.to({rotationSpeedMultiplier:1},500)
		.easing(TWEEN.Easing.Quadratic.InOut);

	tween.chain(tweenBack);
}

ShapeModule.prototype.setVertsFromSpline = function( verts, spline ) {

	var positions = new Array();
	for ( var i=0; i<this.length; i++) {
		var norm = i / (this.length-1);
		var pt = spline.getPoint( norm );
		var pos = new THREE.Vector3( pt.x, pt.y, 0 );
		positions.push( pos );
		// console.log( pt );
	}


	for ( var i=0; i<this.length; i++ ) {
		var v1 = verts[i*2+0];
		var v2 = verts[i*2+1];
		// console.log( i + '/' + this.length );
		var secondIndex = (i+1)%(positions.length-1);
		var dir = positions[i].clone().sub( positions[secondIndex] ).normalize();


		var sine = utils.map( Math.sin( this.sineSeed + (i/(this.length-1)) * Math.PI * 64 ), -1, 1, 0, 1 );
		var thickness = this.baseThickness * this.thicknessMultiplier + sine*this.amplitude*this.amplitudeMultiplier;
		
		v1.x = positions[i].x - (thickness * dir.y);
		v1.y = positions[i].y + (thickness * dir.x);
		v2.x = positions[i].x + (thickness * dir.y);
		v2.y = positions[i].y - (thickness * dir.x);
	}
}

ShapeModule.prototype.pinchRandom = function() {
	// this.pinch( utils.random(this.controlPoints ) );
	var kind = Math.floor( utils.random( 3 ) );
	if ( kind == 0 ) {
		this.pinch();
	}
	else if ( kind == 1 ) {
		this.pinchAcross();
	}
	else if ( kind == 2 ) {
		this.pinchAround();
	}
}

ShapeModule.prototype.pinchAround = function( startIndex ) {
	if ( startIndex == undefined )
		startIndex = this.getNextPinchPoint();

	startIndex = startIndex % ( (this.controlPoints.length-1)*.25 );

	this.pinch( this.controlPoints[startIndex] );
	this.pinch( this.controlPoints[(startIndex+(this.controlPoints.length-1)*.25)%this.controlPoints.length] );
	this.pinch( this.controlPoints[(startIndex+(this.controlPoints.length-1)*.5)%this.controlPoints.length] );
	this.pinch( this.controlPoints[(startIndex+(this.controlPoints.length-1)*.75)%this.controlPoints.length] );
}

ShapeModule.prototype.pinchAcross = function( startIndex ) {
	if ( startIndex == undefined )
		startIndex = this.getNextPinchPoint();

	startIndex = startIndex % ( (this.controlPoints.length-1)*.5 );
	this.pinch( this.controlPoints[startIndex] );
	this.pinch( this.controlPoints[(startIndex+(this.controlPoints.length-1)/2)%this.controlPoints.length] );
}

ShapeModule.prototype.pinch = function( cp ) {

	if ( cp == undefined ) {
		var startIndex = this.getNextPinchPoint();
		cp = this.controlPoints[startIndex];
	}

	// check if this cp is already being animated
	var isTweening = false;
	var allTweens = TWEEN.getAll();
	for ( var t in allTweens ) {
		if ( allTweens[t].getObject()==cp )
			isTweening = true;
	}

	if ( isTweening ) {
		console.log( 'it was already tweening' );
		return;
	}

	var tween = new TWEEN.Tween(cp)
		.to({x:0,y:0}, 100 )
		.easing( TWEEN.Easing.Quadratic.InOut )
		.start();

	var tweenBack = new TWEEN.Tween(cp)
		.to({x:cp.x,y:cp.y}, 300 )
		.easing( TWEEN.Easing.Quadratic.InOut );

	tween.chain(tweenBack);
}

ShapeModule.prototype.setControlPoints = function() {

}

ShapeModule.prototype.getNextPinchPoint = function() {
	return (++this.pinchCounter)%(this.controlPoints.length-1);
};

ShapeModule.prototype.key = function( key ) {

	if ( key == 'A' ) {
		this.throttleRotation();	
	}

	if ( key == 'T' ) {
		this.tweaking = !this.tweaking;
	}

	if ( key == 'S' ) {
		this.breakApart( 'eight' );
	}

	if ( key == 'D' ) {
		this.breakApart( 'two' );
	}

	if ( key == 'Q' ) {
		this.pinchRandom();
	}

	if ( key =='R' ) {
		// this.pinchAcross( Math.floor(utils.random(this.controlPoints.length) ) );
		this.pinchAcross();
	}

	if ( key == 'W' ) {
		this.pinchAround();
	}

	if ( key == 'E' ) {
		this.pinch();
	}
}