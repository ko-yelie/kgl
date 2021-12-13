precision highp float;

uniform vec2 uResolution; // window size (auto added)
uniform float uTime;

void main() {
  float color = max(1. - length(gl_FragCoord.xy / uResolution) * (sin(uTime) * 0.5 + 0.5), 0.);
  gl_FragColor = vec4(vec3(color), 1.);
}
