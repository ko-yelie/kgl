precision highp float;

uniform sampler2D uImage;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  vec4 color = texture2D(uImage, uv);
  color.rgb *= mix(0.2, 2., sin(uTime) * 0.5 + 0.5);
  gl_FragColor = color;
}
