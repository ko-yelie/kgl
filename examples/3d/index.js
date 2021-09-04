import Kgl from '../../src/index.js'

const kgl = new Kgl()

const plane = kgl.createProgram({
  shape: 'plane',
  width: window.innerHeight,
  height: window.innerHeight,
  fragmentShaderId: 'fs',
  uniforms: {
    time: 0,
  },
})

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
let requestID
function tick(time) {
  time *= 0.001

  // kgl.cameraPosition[1] = Math.sin(time) * 500
  // kgl.cameraRotation[1] = Math.sin(time)
  // kgl.updateCamera()

  const scale = 1 - ((Math.sin(time * 2) + 1) / 2) * 0.5
  plane.x = Math.sin(time * 1) * 300
  plane.scale = scale
  plane.rotateY = Math.sin(time * 1) * 1
  plane.uniforms.time = time

  kgl.drawAll()

  requestID = requestAnimationFrame(tick)
}
requestID = requestAnimationFrame(tick)

// setTimeout(() => {
//   if (requestID) {
//     cancelAnimationFrame(requestID)
//   }
//   kgl.destroy()
// }, 3000)
