void discardOutOfRangeUv(vec2 uv) {
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
}

#pragma glslify: export(discardOutOfRangeUv)
