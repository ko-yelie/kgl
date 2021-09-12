# KGL

WebGL library

## Example

### HTML

```html
<!-- Library -->
<script src="https://unpkg.com/@ko-yelie/kgl"></script>

<!-- Shader -->
<script type="x-shader/x-fragment" id="fs">
  precision highp float;

  uniform vec2 uResolution; // window size (auto added)
  uniform float uTime;

  void main() {
    gl_FragColor = vec4(vec3(length(gl_FragCoord.xy / uResolution) * (sin(uTime) * 0.5 + 0.5)), 1.);
  }
</script>
```

### JS

```js
new Kgl({
  programs: {
    main: {
      fragmentShaderId: 'fs',
      uniforms: {
        uTime: 0,
      },
    },
  },
  tick: (kgl, time) => {
    kgl.programs.main.uniforms.uTime = time
    kgl.draw()
  },
  isAutoResize: true,
  isAutoStart: true,
})
```
