precision highp float;

uniform vec2 uResolution;
uniform sampler2D uImage;
uniform vec2 uImageResolution;

#pragma glslify: adjustRatio = require(../../shaders/adjustRatio.glsl)

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  uv.y = 1. - uv.y;
  uv = adjustRatio(uv, uImageResolution, uResolution);

  gl_FragColor = texture2D(uImage, uv);
}
