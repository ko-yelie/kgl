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

  uniform vec2 resolution; // window size (auto added)
  uniform float time;

  void main() {
    gl_FragColor = vec4(vec3(length(gl_FragCoord.xy / resolution) * (sin(time) * 0.5 + 0.5)), 1.);
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
        time: 0
      },
    }
  },
  tick: (kgl, time) => {
    kgl.programs.main.draw({
      time
    })
  },
})
```
