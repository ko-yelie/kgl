precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uStrength;
uniform vec2 uCenter;

#pragma glslify: random = require(glsl-random)

const float nFrag = 1. / 30.;

void main () {
  vec2 tFrag = 1. / uResolution;
  vec3 destColor = vec3(0.);
  float randomValue = random(vec2(12.9898, 78.233));
  vec2 fc = gl_FragCoord.st;
  vec2 fcc = fc - uCenter;
  float totalWeight = 0.;

  for (float i = 0.; i <= 30.; i++) {
    float percent = (i + randomValue) * nFrag;
    float weight = percent - percent * percent;
    vec2 t = fc - fcc * percent * uStrength * nFrag;
    destColor += texture2D(uTexture, t * tFrag).rgb * weight;
    totalWeight += weight;
  }
  gl_FragColor = vec4(destColor / totalWeight, 1.);
}
