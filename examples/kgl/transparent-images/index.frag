precision highp float;

uniform sampler2D uImage;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;

  gl_FragColor = texture2D(uImage, uv);
}
