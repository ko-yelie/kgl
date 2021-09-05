precision highp float;

uniform vec2 uResolution;
uniform sampler2D uTexture;

void main() {
  gl_FragColor = texture2D(uTexture, gl_FragCoord.st / uResolution);
}
