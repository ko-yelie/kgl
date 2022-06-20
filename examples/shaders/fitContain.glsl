vec2 fitContain(vec2 coord, vec2 inputResolution, vec2 outputResolution) {
  vec2 ratio = vec2(
    max((outputResolution.x / outputResolution.y) / (inputResolution.x / inputResolution.y), 1.0),
    max((outputResolution.y / outputResolution.x) / (inputResolution.y / inputResolution.x), 1.0)
  );
  return coord * ratio + (1. - ratio) * 0.5;
}

#pragma glslify: export(fitContain)
