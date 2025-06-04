// src/lib/three/postprocessing/AfterimagePass.js
import {
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { AfterimageShader } from '../shaders/AfterimageShader.js';

class AfterimagePass extends Pass {

	constructor( damp = 0.96 ) {

		super();

		if ( AfterimageShader === undefined ) {

			console.error( 'THREE.AfterimagePass relies on AfterimageShader' );

		}

		this.shader = AfterimageShader;

		this.uniforms = UniformsUtils.clone( this.shader.uniforms );

		this.uniforms[ 'damp' ].value = damp;

		this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		this.shaderMaterial = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: this.shader.vertexShader,
			fragmentShader: this.shader.fragmentShader

		} );

		this.fsQuad = new FullScreenQuad( this.shaderMaterial );

		// This material's map will be textureComp.texture
		this.compFsQuad = new FullScreenQuad( new MeshBasicMaterial() );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		this.uniforms[ 'tOld' ].value = this.textureOld.texture;
		this.uniforms[ 'tNew' ].value = readBuffer.texture;

		// Render the afterimage effect using tOld and tNew into textureComp
		renderer.setRenderTarget( this.textureComp );
		this.fsQuad.render( renderer );

		// Set the composite material's map to the result
		this.compFsQuad.material.map = this.textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.compFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.compFsQuad.render( renderer );

		}

		// Swap textureOld and textureComp for the next frame
		const temp = this.textureOld;
		this.textureOld = this.textureComp;
		this.textureComp = temp;
		// Now textureOld contains what was in textureComp (the latest composite image)

	}

	setSize( width, height ) {

		this.textureComp.setSize( width, height );
		this.textureOld.setSize( width, height );

	}

	dispose() {

		this.textureComp.dispose();
		this.textureOld.dispose();

		this.shaderMaterial.dispose();
		this.fsQuad.dispose();
		this.compFsQuad.material.dispose(); // Dispose MeshBasicMaterial
		this.compFsQuad.dispose();

	}

}

export { AfterimagePass };
