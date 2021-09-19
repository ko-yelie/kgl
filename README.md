# KGL

Minimal WebGL library

## Usage

### Installation

#### ES Modules

[npm](https://www.npmjs.com/package/@ko-yelie/kgl)

```sh
npm i @ko-yelie/kgl
```

```js
// Kgl
import Kgl from '@ko-yelie/kgl'

// KglAuto
import { KglAuto } from '@ko-yelie/kgl'
```

#### CDN

[unpkg](https://unpkg.com/@ko-yelie/kgl)

```html
<script src="https://unpkg.com/@ko-yelie/kgl"></script>
```

```js
// Kgl
Kgl.default

// KglAuto
const { KglAuto } = Kgl
```

### `Kgl`

#### HTML

```html
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
import Kgl from '@ko-yelie/kgl'

const kgl = new Kgl()

/**
 * program
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

#### JS

```js
import { KglAuto } from '@ko-yelie/kgl'

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

## Examples

https://ko-yelie.github.io/kgl/
