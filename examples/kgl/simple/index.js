import Kgl from '../../../src/index.js'

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
