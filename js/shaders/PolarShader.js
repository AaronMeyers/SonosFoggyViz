THREE.PolarShader = {

	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"offset": { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"aspect": { type: "v2", value: new THREE.Vector2( 1, 1 ) },
		"minRadius":  { type: "f", value: 0.0 },
		"maxRadius":  { type: "f", value: 1.0 },
		"rotation":  { type: "f", value: 0.0 }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"uniform vec2 offset, aspect;",
		"uniform float minRadius, maxRadius, rotation;",

		"const float TWO_PI = 6.2831853072;",

		"float map(float x, float inmin, float inmax, float outmin, float outmax) {",
		  "return ((x-inmin) / (inmax-inmin)) * (outmax-outmin) + outmin;",
		"}",

		"void main() {",
			"vec2 center = vec2(.5, .5);",
			"vec2 screenPosition = vUv - center + offset;",
			"screenPosition.x *= (aspect.x / aspect.y);",
			"float theta = atan(screenPosition.y, screenPosition.x);",
			"theta += rotation;",
			"theta = theta / TWO_PI;",
			"theta = mod(theta, 1.);",
			"float radius = length(screenPosition) * 2.;",
			"radius = map(radius, minRadius, maxRadius, 0., 1.);",
			"vec2 polar = vec2(theta, radius);",
			"gl_FragColor = texture2D(tDiffuse, polar);",
		"}",
	].join("\n")

};
