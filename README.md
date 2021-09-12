# KGL

Minimal WebGL library

## Example

### `Kgl`

#### HTML

```html
<!-- Library -->
<script src="https://unpkg.com/@ko-yelie/kgl"></script>

<!-- Shader -->
<script type="x-shader/x-fragment" id="fs">
  precision highp float;

  uniform vec2 uResolution; // window size (auto added)
  uniform float uTime;

  void main() {
    float alpha = 1. - length(gl_FragCoord.xy / uResolution) * (sin(uTime) * 0.5 + 0.5);
    gl_FragColor = vec4(vec3(0.), alpha);
  }
</script>
```

#### JS

```js
const kgl = new Kgl()

/**
 * objects
 */
const program = kgl.createProgram({
  fragmentShaderId: 'fs',
  uniforms: {
    uTime: 0,
  },
  isAutoAdd: true,
})

/**
 * resize
 */
function resize() {
  kgl.resize()
}
resize()
window.addEventListener('resize', resize)

/**
 * tick
 */
function tick(time) {
  program.uniforms.uTime = time * 0.001

  kgl.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
```

### `KglAuto`

#### HTML

```html
<!-- Library -->
<script src="https://unpkg.com/@ko-yelie/kgl"></script>

<!-- Shader -->
<script type="x-shader/x-fragment" id="fs">
  precision highp float;

  uniform vec2 uResolution; // window size (auto added)
  uniform float uTime;

  void main() {
    float alpha = 1. - length(gl_FragCoord.xy / uResolution) * (sin(uTime) * 0.5 + 0.5);
    gl_FragColor = vec4(vec3(0.), alpha);
  }
</script>
```

#### JS

```js
const { KglAuto } = Kgl

new KglAuto({
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
})
```

## Demo

- [Page](https://ko-yelie.github.io/kgl/)
- [Code](https://github.com/ko-yelie/kgl/tree/master/examples)
