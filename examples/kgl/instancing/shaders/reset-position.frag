precision highp float;

uniform vec2 uSize;

#pragma glslify: random = require(glsl-random)

void main () {
  vec2 nPosition = gl_FragCoord.st / uSize * 2. - 1.;
  vec4 position = vec4(
    nPosition * uSize,
    0.,
    random(nPosition)
  );
  gl_FragColor = position;
}
