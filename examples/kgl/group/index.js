import Kgl from '../../../src/index.js'
import fragmentShader from './index.frag'
import fragmentShaderCross from './cross.frag'

const kgl = new Kgl({
  hasCamera: true,
})
const { root } = kgl // root group

/**
 * program
 */

/* group cross */
const groupCross = kgl.createGroup({
  isAutoAdd: true, // add to kgl.root
})

/* cross1 */
const cross1 = kgl.createProgram({
  shape: 'plane',
  width: 200,
  height: 50,
  fragmentShader: fragmentShaderCross,
})
groupCross.add(cross1)

/* cross2 */
const cross2 = kgl.createProgram({
  shape: 'plane',
  width: 50,
  height: 200,
  fragmentShader: fragmentShaderCross,
})
groupCross.add(cross2)

/* plane1 */
const size = 500
const plane1 = kgl.createProgram({
  shape: 'plane',
  width: size,
  height: size,
  fragmentShader,
  uniforms: {
    uTime: 0,
  },
  isTransparent: true,
})
kgl.add(plane1) // add to kgl.root

/* plane2 */
const size2 = 100
const plane2 = kgl.createProgram({
  shape: 'plane',
  width: size2,
  height: size2,
  fragmentShader,
  uniforms: {
    uTime: 0,
  },
  isTransparent: true,
})
kgl.add(plane2) // add to kgl.root

/**
 * resize
 */
function resize() {
  kgl.extraFar = size / 2
  kgl.resize()
}
resize()
window.addEventListener('resize', resize)

/**
 * tick
 */
function tick(time) {
  time *= 0.001

  // kgl.cameraPosition[1] = Math.sin(time * 0.5) * 300
  // kgl.cameraRotation[1] = Math.sin(time * 0.1)
  // kgl.updateCamera()

  root.x = -Math.sin(time * 0.5) * 500

  plane1.x = Math.sin(time * 1) * 300
  plane1.scale = 1 - ((Math.sin(time * 2) + 1) / 2) * 0.5
  plane1.rotateY = Math.sin(time * 1) * 1
  plane1.uniforms.uTime = time

  plane2.y = Math.sin(time * 1) * 300
  plane2.rotateX = Math.sin(time * 1) * 1
  plane2.uniforms.uTime = time

  groupCross.rotate = time * 3
  cross2.x = -Math.sin(time * 5) * 100

  kgl.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)

/**
 * add, remove
 */
// let isExistPlane1 = true
// setInterval(() => {
//   if (isExistPlane1) {
//     kgl.remove(plane1)
//     isExistPlane1 = false
//   } else {
//     kgl.add(plane1)
//     isExistPlane1 = true
//   }
// }, 1000)
