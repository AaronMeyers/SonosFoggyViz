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
		"varying vec2 screenPosition;",
		"uniform vec2 offset, aspect;",

		"void main() {",
			"screenPosition = uv - offset - vec2(.5, .5);",
			"screenPosition.x *= (aspect.x / aspect.y);",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tDiffuse;",
		"varying vec2 screenPosition;",
		"uniform float minRadius, maxRadius, rotation;",

		"const float TWO_PI = 6.2831853072;",

		"void main() {",
			"float radius = length(screenPosition) * 2.;",
			"if(radius > maxRadius || radius < minRadius) discard;",
			"radius = (radius - minRadius) / (maxRadius - minRadius);",
			"float theta = atan(screenPosition.y, screenPosition.x);",
			"theta = mod((theta + rotation) / TWO_PI, 1.);",
			"gl_FragColor = texture2D(tDiffuse, vec2(theta, radius));",
		"}",
	].join("\n")

};
