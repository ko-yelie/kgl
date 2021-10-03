import Kgl from '../../../src/index.ts'
import vertexShader from './index.vert'
import fragmentShader from './index.frag'

const kgl = new Kgl({
  hasCamera: true,
})

/**
 * program
 */
const halfSize = 100
const points = kgl.createProgram({
  shape: 'point',
  attributes: {
    aPosition: {
      value: [
        -halfSize,
        halfSize,
        0,
        -halfSize,
        -halfSize,
        0,
        halfSize,
        halfSize,
        0,
        halfSize,
        -halfSize,
        0,
      ],
      size: 3,
    },
    aRandom: {
      value: [Math.random(), Math.random(), Math.random(), Math.random()],
      size: 1,
    },
  },
  vertexShader,
  fragmentShader,
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
  time *= 0.001

  // points.x = Math.sin(time * 1) * 100
  points.uniforms.uTime = time * 2

  kgl.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
