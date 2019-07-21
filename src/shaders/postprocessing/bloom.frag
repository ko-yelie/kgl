precision highp float;

uniform vec2 resolution;
uniform sampler2D specular;

const float brightness = 0.7;
const float spread = 0.3;

void main() {
  vec2 uv = gl_FragCoord.st / resolution;
  vec4 specularColor = texture2D(specular, uv);
  specularColor.rgb = pow(specularColor.rgb, vec3(1. - brightness));
  specularColor.a = pow(specularColor.a, 1. - spread);
  gl_FragColor = specularColor;
  // gl_FragColor = vec4(vec3(specularColor.a), 1.); // * debug
  // gl_FragColor = vec4(texture2D(specular, uv).rgb, 1.); // * debug
}
