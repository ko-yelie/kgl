precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uRadius;
uniform bool uIsHorizontal;

#pragma glslify: blur = require(glsl-fast-gaussian-blur)

void main () {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 direction = uIsHorizontal ? vec2(1., 0.) : vec2(0., 1.);
  direction *= uRadius;
  gl_FragColor = blur(uTexture, uv, uResolution, direction);
}
