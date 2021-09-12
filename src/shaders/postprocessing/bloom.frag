precision highp float;

uniform vec2 uResolution;
uniform sampler2D uSpecular;

const float brightness = 0.7;
const float spread = 0.3;

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  vec4 specularColor = texture2D(uSpecular, uv);
  specularColor.rgb = pow(specularColor.rgb, vec3(1. - brightness));
  specularColor.a = pow(specularColor.a, 1. - spread);
  gl_FragColor = specularColor;
  // gl_FragColor = vec4(vec3(specularColor.a), 1.); // * debug
  // gl_FragColor = vec4(texture2D(uSpecular, uv).rgb, 1.); // * debug
}
