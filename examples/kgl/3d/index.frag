precision highp float;

uniform float uTime;

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vec3(1. / length(vUv * 2. - 1.) * (sin(uTime) * 0.5 + 0.5)), 1.);
}
