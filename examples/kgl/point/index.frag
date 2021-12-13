precision highp float;

uniform float uTime;

varying float vRandom;

void main() {
  vec2 uv = gl_PointCoord;
  gl_FragColor = vec4(
    smoothstep(0.97, 1., 1. / length(uv * 2. - 1.) * mix(0.1, 1., sin(uTime * vRandom) * 0.5 + 0.5))
  );
}
