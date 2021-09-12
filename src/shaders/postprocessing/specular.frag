precision highp float;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uThreshold;

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  vec4 color = texture2D(uTexture, uv);
  if (color.a == 0. || length(color.rgb) < uThreshold * 1.732) discard;
  gl_FragColor = color;
}
