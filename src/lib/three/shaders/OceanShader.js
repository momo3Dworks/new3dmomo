
// src/lib/three/shaders/OceanShader.js

const OceanVertexShader = /* glsl */`
  uniform float u_time;
  uniform vec2 u_bigWavesFrequency;
  uniform float u_bigWavesElevation;
  uniform float u_bigWavesSpeed;

  uniform float u_smallWavesElevation;
  uniform float u_smallWavesFrequency;
  uniform float u_smallWavesSpeed;
  uniform float u_smallWavesIterations;

  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;

  // Classic Perlin 3D Noise by Stefan Gustavson
  // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float perlinNoise3D(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.y, Pf0.z));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.x, Pf1.y, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.x, Pf0.y, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.y, Pf1.z));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }


  void main() {
    vUv = uv;
    vec3 pos_world = position;

    // Big Waves (Gerstner-like calculation for position)
    float bigWaveX = pos_world.x * u_bigWavesFrequency.x + u_time * u_bigWavesSpeed;
    float bigWaveZ = pos_world.z * u_bigWavesFrequency.y + u_time * u_bigWavesSpeed; // Using .y of frequency for Z
    float elevationBig = sin(bigWaveX) * cos(bigWaveZ) * u_bigWavesElevation;

    // Small Waves (Iterative Perlin noise)
    float elevationSmall = 0.0;
    float frequency = u_smallWavesFrequency;
    float amplitude = u_smallWavesElevation;
    for (int i = 0; i < int(u_smallWavesIterations); i++) {
        elevationSmall += perlinNoise3D(vec3(
            pos_world.x * frequency + u_time * u_smallWavesSpeed * (float(i) * 0.5 + 1.0),
            pos_world.y * frequency, // Keep Y fixed for surface noise
            pos_world.z * frequency + u_time * u_smallWavesSpeed * (float(i) * 0.5 + 1.0)
        )) * amplitude;
        frequency *= 1.8; // Lacunarity
        amplitude *= 0.6; // Gain
    }

    vElevation = elevationBig + elevationSmall;
    pos_world.y += vElevation;

    vWorldPosition = (modelMatrix * vec4(pos_world, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_world, 1.0);
  }
`;

const OceanFragmentShader = /* glsl */`
  uniform vec3 u_depthColor;
  uniform vec3 u_surfaceColor;
  uniform float u_colorOffset;
  uniform float u_colorMultiplier;
  uniform vec3 u_foamColor;
  uniform samplerCube u_envMap;
  uniform vec3 u_cameraPosition;
  uniform vec2 u_textureOffset; // New uniform for texture offset

  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;

  // Basic pseudo-random number generator
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Simple 2D noise function (can be replaced with a texture lookup if preferred)
  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
  }


  void main() {
    vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    if (!gl_FrontFacing) {
        normal = -normal;
    }
    
    vec3 viewDirection = normalize(u_cameraPosition - vWorldPosition);
    vec3 reflectDirection = reflect(-viewDirection, normal);
    vec4 envColor = textureCube(u_envMap, reflectDirection);

    // Fresnel effect for reflections
    float fresnel = 0.02 + 0.98 * pow(1.0 - dot(viewDirection, normal), 5.0);

    // Water color based on depth (approximated by elevation or other means)
    float depthFactor = smoothstep(0.0, 1.0, (vElevation - u_colorOffset) * u_colorMultiplier);
    vec3 waterColor = mix(u_depthColor, u_surfaceColor, depthFactor);
    
    // Foam effect
    // Apply texture offset to the UVs used for noise
    vec2 offsetUv = vUv + u_textureOffset;
    float foamNoise = noise(offsetUv * 10.0 + vElevation * 2.0); // Make noise pattern depend on elevation
    float foamPattern = smoothstep(0.65, 0.85, foamNoise * (1.0 + vElevation * 0.5)); // More foam on wave crests
    
    // Mix water color with environment reflection using fresnel
    vec3 finalColor = mix(waterColor, envColor.rgb, fresnel);
    
    // Add foam on top
    finalColor = mix(finalColor, u_foamColor, foamPattern);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export { OceanVertexShader, OceanFragmentShader };
