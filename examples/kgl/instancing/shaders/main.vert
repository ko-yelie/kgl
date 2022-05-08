attribute vec3 aPosition;
attribute vec2 aUv;
attribute vec3 aNormal;
attribute vec2 aInstancedUv;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform mat4 uMvpMatrix;
uniform mat4 uInvMatrix;
uniform vec3 uLightDirection;
uniform vec3 uAmbientColor;
uniform vec3 uEyeDirection;
uniform float uTime;

varying vec2 vUv;
varying vec4 vColor;

#pragma glslify: rotateQ = require(glsl-y-rotate/rotateQ)
#pragma glslify: random = require(glsl-random)
#pragma glslify: hsv = require(../../../shaders/hsv.glsl)
#pragma glslify: PI = require(../../../shaders/PI.glsl)

const float PI2 = PI * 2.;
const float colorInterval = PI2 * 10.;
const float scale = 2.;
const float maxScaleRate = 1.4;
const float rotationSpeed = 100.;
const float minRotationSpeed = 0.1;

void main () {
  vec3 modelPosition = aPosition;
  vec4 instancedPosition = texture2D(uPositionTexture, aInstancedUv);
  float randomValue = instancedPosition.w;

  float velocity = texture2D(uVelocityTexture, aInstancedUv).w;
  float life = smoothstep(0.01, 0.04, velocity);

  float cScale = scale;
  cScale *= life;
  cScale *= mix(1., maxScaleRate, (instancedPosition.z - 1.) * 0.01);
  modelPosition *= cScale;

  vec3 axis = normalize(vec3(
    random(vec2(randomValue, 0.)),
    random(vec2(0., randomValue)),
    random(vec2(randomValue, 1.))
  ));
  float radian = PI2 * random(vec2(randomValue));
  radian += velocity * mix(minRotationSpeed, rotationSpeed, randomValue);
  mat3 rotate = rotateQ(axis, radian);
  modelPosition *= rotate;

  vec3 cNormal = normalize(aNormal);
  cNormal *= rotate;
  vec3 invLight = normalize(uInvMatrix * vec4(uLightDirection, 0.)).rgb;
  vec3 invEye = normalize(uInvMatrix * vec4(uEyeDirection, 0.)).rgb;
  vec3 halfLE = normalize(invLight + invEye);
  float diffuse = clamp(dot(cNormal, invLight), 0.1, 1.);
  float specular = pow(clamp(dot(cNormal, halfLE), 0., 1.), 50.);

  vUv = aUv;

  float colorNTime = mod(uTime, colorInterval) / colorInterval;
  float alpha = 1.;
  vColor = vec4(hsv(colorNTime * PI2, 0.25 + 0.7 * colorNTime, 0.85 + 0.1 * colorNTime), alpha);
  vColor.rgb *= vec3(diffuse + specular);
  vColor.rgb += uAmbientColor;
  vColor.rgb *= mix(0.2, 1., clamp(((instancedPosition + 100.) / 200.).z, 0., 1.));
  vColor.rgb *= life;

  gl_Position = uMvpMatrix * (vec4(modelPosition + instancedPosition.xyz, 1.));
}
