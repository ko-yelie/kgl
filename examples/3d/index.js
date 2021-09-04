import Kgl from '../../src/index.js'

const kgl = new Kgl({
  programs: {
    plane: {
      shape: 'plane',
      width: window.innerHeight,
      height: window.innerHeight,
      fragmentShaderId: 'fs',
      uniforms: {
        time: 0,
      },
    },
  },
})
const { plane } = kgl.programs

/**
 * resize
 */
function resize() {
  kgl.resize()
  plane.width = window.innerHeight
  plane.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

/**
 * tick
 */
function tick(time) {
  time *= 0.001

  // kgl.cameraPosition[1] = Math.sin(time) * 500
  // kgl.cameraRotation[1] = Math.sin(time)
  // kgl.updateCamera()

  const scale = 1 - ((Math.sin(time * 2) + 1) / 2) * 0.5
  plane.x = Math.sin(time * 1) * 300
  plane.scale = scale
  plane.rotateY = Math.sin(time * 1) * 1
  plane.updateUniforms({
    time,
  })

  kgl.drawAll()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
