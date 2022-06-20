precision highp float;

uniform vec2 uResolutionShape;
uniform sampler2D uImage;
uniform vec2 uImageResolution;
uniform float uScrollDiff;

varying vec2 vUv;

#pragma glslify: PI = require(../../shaders/PI.glsl)
#pragma glslify: fitContain = require(../../shaders/fitContain.glsl)
#pragma glslify: discardOutOfRangeUv = require(../../shaders/discardOutOfRangeUv.glsl)

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv = fitContain(uv, uImageResolution, uResolutionShape);
  uv.y += sin(uv.x * PI) * uScrollDiff;
  discardOutOfRangeUv(uv);

  gl_FragColor = texture2D(uImage, uv);
  // gl_FragColor = vec4(1.);
}
