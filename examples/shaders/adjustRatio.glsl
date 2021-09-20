vec2 adjustRatio(vec2 uv, vec2 inputResolution, vec2 outputResolution) {
  vec2 ratio = vec2(
    min((outputResolution.x / outputResolution.y) / (inputResolution.x / inputResolution.y), 1.),
    min((outputResolution.y / outputResolution.x) / (inputResolution.y / inputResolution.x), 1.)
  );
  return uv * ratio + (1. - ratio) * 0.5;
}

#pragma glslify: export(adjustRatio)
