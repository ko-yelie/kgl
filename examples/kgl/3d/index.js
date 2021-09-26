import Kgl from '../../../src/index.js'
import fragmentShader from './index.frag'

const kgl = new Kgl({
  hasCamera: true,
})

/**
 * program
 */
const plane = kgl.createProgram({
  shape: 'plane',
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
  const size = window.innerHeight

  kgl.extraFar = size / 2
  kgl.resize()

  plane.width = size
  plane.height = size
}
resize()
window.addEventListener('resize', resize)

/**
 * tick
 */
function tick(time) {
  time *= 0.001

  plane.x = Math.sin(time * 1) * 300
  plane.scale = 1 - ((Math.sin(time * 2) + 1) / 2) * 0.5
  plane.rotateY = Math.sin(time * 1) * 1
  plane.uniforms.uTime = time

  kgl.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
