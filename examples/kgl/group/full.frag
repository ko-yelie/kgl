precision highp float;

uniform float uTime;

const vec3 color = vec3(181. / 255., 174. / 255., 161. / 255.);

void main() {
  gl_FragColor = vec4(color * mix(1.1, 1.5, sin(uTime) * 0.5 + 0.5), 1.);
}
