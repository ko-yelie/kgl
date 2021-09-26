precision highp float;

uniform vec2 uSize;
uniform sampler2D uPrevPositionTexture;
uniform sampler2D uVelocityTexture;

void main () {
  vec2 uv = gl_FragCoord.st / uSize;
  vec4 prevPosition = texture2D(uPrevPositionTexture, uv);
  vec4 velocity = texture2D(uVelocityTexture, uv);

  vec3 position;
  if (velocity.w == 1.) {
    vec2 nPosition = uv * 2. - 1.;
    position = vec3(nPosition * uSize, 0.);
  } else {
    position = prevPosition.xyz + velocity.xyz;
  }

  gl_FragColor = vec4(position, prevPosition.w);
}
