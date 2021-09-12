import Kgl from '../../../src/index.js'

const kgl = new Kgl({
  hasCamera: true,
})

/**
 * objects
 */
const plane = kgl.createProgram({
  shape: 'plane',
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

  const size = window.innerHeight
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
