import Kgl from '../../../src/index.ts'
import fragmentShader from './index.frag'

const kgl = new Kgl()

/**
 * program
 */
const program = kgl.createProgram({
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
  program.uniforms.uTime = time * 0.001

  kgl.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
