precision highp float;

uniform float uTime;

varying vec2 vUv;

void main() {
  float alpha = 1. - min(max(1. / length(vUv * 2. - 1.) * (sin(uTime) * 0.5 + 0.5), 0.), 1.);
  gl_FragColor = vec4(vec3(0.), alpha);
}
