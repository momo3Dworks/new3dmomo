
// import * as THREE from 'three'; // Not strictly needed here for shader strings
const CopyShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }
	},
	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
	fragmentShader: /* glsl */`
		uniform float opacity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
			gl_FragColor = texture2D( tDiffuse, vUv ) * opacity;
		}`
};
export { CopyShader };

    