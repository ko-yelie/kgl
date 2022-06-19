precision highp float;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uTextureCache;

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  gl_FragColor = texture2D(uTexture, uv) + texture2D(uTextureCache, uv);
}
