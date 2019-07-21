precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float radius;
uniform bool isHorizontal;

#pragma glslify: blur = require(glsl-fast-gaussian-blur)

void main () {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 direction = isHorizontal ? vec2(1., 0.) : vec2(0., 1.);
  direction *= radius;
  gl_FragColor = blur(texture, uv, resolution, direction);
}
