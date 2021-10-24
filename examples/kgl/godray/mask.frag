precision highp float;

uniform vec2 uResolution;
uniform sampler2D uImage;
uniform vec2 uImageResolution;

#pragma glslify: fitCover = require(../../shaders/fitCover.glsl)

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  uv.y = 1. - uv.y;
  uv = fitCover(uv, uImageResolution, uResolution);

  gl_FragColor = texture2D(uImage, uv);
}
