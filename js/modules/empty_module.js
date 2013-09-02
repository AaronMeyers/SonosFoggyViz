EmptyModule = function( audio, scene, guiFolder ) {

	// Standard Module Vars
	this.audio = audio;
	this.scene = scene;
	this.node = new THREE.Object3D();
	this.gui = guiFolder;
	this.init();
}

EmptyModule.prototype.on = function() {
	this.scene.add( this.node );
}

EmptyModule.prototype.off = function() {
	this.scene.remove( this.node );
}

EmptyModule.prototype.init = function() {
	this.empty = "i'm empty!";
	this.gui.add( this, 'empty' );
}

EmptyModule.prototype.update = function() {

}

EmptyModule.prototype.key = function( key ) {

}