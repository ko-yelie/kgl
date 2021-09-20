precision highp float;

uniform vec2 uResolution;
uniform sampler2D uImage;
uniform vec2 uImageResolution;
uniform float uTime;

const float pSpeed = 1.5;

#pragma glslify: PI = require(../../shaders/PI.glsl)
#pragma glslify: adjustRatio = require(../../shaders/adjustRatio.glsl)
#pragma glslify: getZoomedUv = require(../../shaders/getZoomedUv.glsl)

void main() {
  vec2 uv = gl_FragCoord.st / uResolution;
  uv.y = 1. - uv.y;
  uv = adjustRatio(uv, uImageResolution, uResolution);

  vec2 uvCenter = uv * 2. - 1.;
  float distortion = min(max(1. / length(uvCenter) * (sin(uTime * pSpeed - PI * 0.5) * 0.5 + 0.5), 0.), 1.);
  distortion = smoothstep(0.6, 0.8, distortion) * smoothstep(1., 0.8, distortion);

  vec2 zoomedUv = getZoomedUv(uv, 0.8, vec2(0.));

  gl_FragColor = texture2D(uImage, mix(uv, zoomedUv, distortion));
  // gl_FragColor = vec4(vec3(distortion), 1.);
}
