// src/lib/three/shaders/AfterimageShader.js
const AfterimageShader = {

	uniforms: {
		'damp': { value: 0.96 },
		'tOld': { value: null },
		'tNew': { value: null }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`
		uniform float damp;
		uniform sampler2D tOld;
		uniform sampler2D tNew;
		varying vec2 vUv;
		vec4 originalColor;
		vec4 previousColor;
		void main() {
			originalColor = texture2D(tNew, vUv);
			previousColor = texture2D(tOld, vUv);
			gl_FragColor = mix(originalColor, previousColor, damp);
		}`

};

export { AfterimageShader };
