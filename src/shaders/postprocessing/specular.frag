precision highp float;

uniform vec2 resolution;
uniform sampler2D texture;
uniform float threshold;

void main() {
  vec2 uv = gl_FragCoord.st / resolution;
  vec4 color = texture2D(texture, uv);
  if (color.a == 0. || length(color.rgb) < threshold * 1.732) discard;
  gl_FragColor = color;
}
