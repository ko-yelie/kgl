precision highp float;

attribute vec3 aPosition;
attribute float aRandom;

uniform mat4 uMvpMatrix;
uniform float uTime;

varying float vRandom;

void main () {
  vRandom = aRandom;

  vec3 position = aPosition;
  float time = uTime * aRandom;
  position.xy += vec2(cos(time), sin(time)) * 30.;

  gl_Position = uMvpMatrix * vec4(position, 1.);
  gl_PointSize = mix(50., 100., aRandom);
}
