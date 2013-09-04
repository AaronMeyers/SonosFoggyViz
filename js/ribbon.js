function Ribbon()
{
	this.positions			= [];
	this.rotations			= [];

	this.node				= new THREE.Object3D();
	this.node.position.z	= 10;

	this.sineSeed			= utils.random( Math.PI * 2 );
	this.sineSpeedBase		= .01;
	this.sineSpeed			= this.sineSpeedBase;
	
	this.baseWidth			= 10;
	this.width				= 175;//utils.random(5, 30);
	this.length				= 100;//utils.random(80, 140);
	
	this.geom				= new THREE.PlaneGeometry(100, 300, 1, this.length-1);
	this.material			= new THREE.MeshBasicMaterial( { color:0x000000, wireframe: false } );
	
	this.mesh				= new THREE.Mesh(this.geom, this.material);
	this.mesh.dynamic		= true;
	this.mesh.doubleSided	= true;

	this.splinePoints = new Array();
	this.splinePoints.push( new THREE.Vector3( 0, window.innerHeight*.75, 0 ) );
	this.splinePoints.push( new THREE.Vector3( utils.random(-300,300), window.innerHeight * .25, 0 ) );
	this.splinePoints.push( new THREE.Vector3( utils.random(-300,300), -window.innerHeight * .25, 0 ) );
	this.splinePoints.push( new THREE.Vector3( 0, -window.innerHeight*.75, 0 ) );

	this.spline = new THREE.Spline( this.splinePoints );
	

	this.node.add( this.mesh );

	this.meshL = new THREE.Mesh(this.geom, this.material);
	this.meshL.position.x = -window.innerWidth;
	this.node.add( this.meshL );

	this.meshR = new THREE.Mesh( this.geom, this.material );
	this.meshR.position.x = window.innerWidth;
	this.node.add( this.meshR );

	for ( var i=0; i<this.length+1; i++ ) {
		// this.positions.push( new THREE.Vector3( 0,0,0 ) );
		this.positions.push( new THREE.Vector3( i*i, i * 30, 0 ) );
	}

	this.jumble = function() {
		for ( var i=1; i<this.splinePoints.length-1; i++ ) {
			var tween = new TWEEN.Tween(this.splinePoints[i])
				.to({x:utils.random(-300,300)}, 200)
				.easing( TWEEN.Easing.Quadratic.InOut )
				.start();
		}
	}

	this.throttle = function( amount, time1, time2 ) {
		var tween = new TWEEN.Tween(this)
			.to({sineSpeed:this.sineSpeedBase*amount}, time1)
			.start();

		var tweenBack = new TWEEN.Tween(this)
			.to({sineSpeed:this.sineSpeedBase}, time2)
			.easing( TWEEN.Easing.Quadratic.InOut );

		tween.chain( tweenBack );
	}


	this.update = function() {

		this.sineSeed += this.sineSpeed;
		
		// if ( this.positions[this.positions.length-1].distanceTo( this.positions[this.positions.length-2] ) > 20.0 ) {
		// 	this.positions.splice(0,1);
		// 	this.positions.push( new THREE.Vector3( mouseX, mouseY, 0 ) );
		// }
		// else {
		// 	this.positions[this.positions.length-1].set( mouseX, mouseY, 0 );
		// }
		// console.log(t);

		for ( var i=0; i<this.positions.length; i++ ) {
			var pt = this.spline.getPoint( i/(this.positions.length-1) );
			this.positions[i].set( pt.x, pt.y, pt.z );
		}


		for ( var i=0; i<this.length; i++ ) {

			var sineVal =  ( Math.sin( ( i / this.length ) * Math.PI * 2.0 + this.sineSeed ) + 1 ) / 2;

			var thickness = sineVal * this.width + this.baseWidth;

			var v1 = this.geom.vertices[i*2];
			var v2 = this.geom.vertices[i*2+1];
			var dir = this.positions[i].clone().sub( this.positions[i+1] ).normalize();
			v1.x = this.positions[i].x - (thickness * dir.y);
			v1.y = this.positions[i].y + (thickness * dir.x);
			v2.x = this.positions[i].x + (thickness * dir.y);
			v2.y = this.positions[i].y - (thickness * dir.x);
		}
		this.geom.verticesNeedUpdate = true;
		// this.geom.colorsNeedUpdate = true;
	}
	
}