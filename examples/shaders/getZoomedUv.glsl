vec2 getZoomedUv(vec2 uv, float zoom, vec2 origin) {
  origin.x = -origin.x;
  uv += origin;
  float scale = 1. / zoom;
  return uv * scale - 0.5 * (scale - 1.);
}

#pragma glslify: export(getZoomedUv)
