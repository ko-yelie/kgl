precision highp float;

uniform vec2 resolution;
uniform sampler2D texture;

void main() {
  gl_FragColor = texture2D(texture, gl_FragCoord.st / resolution);
}
