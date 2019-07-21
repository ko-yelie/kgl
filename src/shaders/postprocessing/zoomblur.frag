precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float strength;
uniform vec2 center;

#pragma glslify: random = require(glsl-random)

const float nFrag = 1. / 30.;

void main () {
  vec2 tFrag = 1. / resolution;
  vec3 destColor = vec3(0.);
  float randomValue = random(vec2(12.9898, 78.233));
  vec2 fc = gl_FragCoord.st;
  vec2 fcc = fc - center;
  float totalWeight = 0.;

  for (float i = 0.; i <= 30.; i++) {
    float percent = (i + randomValue) * nFrag;
    float weight = percent - percent * percent;
    vec2 t = fc - fcc * percent * strength * nFrag;
    destColor += texture2D(texture, t * tFrag).rgb * weight;
    totalWeight += weight;
  }
  gl_FragColor = vec4(destColor / totalWeight, 1.);
}
