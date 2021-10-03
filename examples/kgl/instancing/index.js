import Kgl from '../../../src/index.ts'
import resetVelocityFrag from './shaders/reset-velocity.frag'
import resetPositionFrag from './shaders/reset-position.frag'
import velocityFrag from './shaders/velocity.frag'
import positionFrag from './shaders/position.frag'
import mainVert from './shaders/main.vert'
import mainFrag from './shaders/main.frag'

const width = 100
const height = 100

const sizeUniform = [width, height]
const particleUv = []

for (let i = 0; i < width; i++) {
  for (let j = 0; j < height; j++) {
    particleUv.push(i / (width - 1), 1 - j / (height - 1))
  }
}

/**
 * generate KGL
 */
const kgl = new Kgl({
  clearedColor: [0, 0, 0, 1],
  hasCamera: true,
  hasLight: true,
  cameraPosition: [0, 0, 480],
  fov: 50,
})

/**
 * program
 */
const programResetVelocity = kgl.createProgram({
  fragmentShader: resetVelocityFrag,
  isFloats: true,
})

const programResetPosition = kgl.createProgram({
  fragmentShader: resetPositionFrag,
  uniforms: {
    uSize: sizeUniform,
  },
  isFloats: true,
})

const programVelocity = kgl.createProgram({
  fragmentShader: velocityFrag,
  uniforms: {
    uSize: sizeUniform,
    uPrevVelocityTexture: 'framebuffer',
    uPrevPositionTexture: 'framebuffer',
  },
  isFloats: true,
})

const programPosition = kgl.createProgram({
  fragmentShader: positionFrag,
  uniforms: {
    uSize: sizeUniform,
    uPrevPositionTexture: 'framebuffer',
    uVelocityTexture: 'framebuffer',
  },
  isFloats: true,
})

const programMain = kgl.createProgram({
  shape: 'cube',
  // shape: 'plane',
  vertexShader: mainVert,
  fragmentShader: mainFrag,
  instancedAttributes: {
    aInstancedUv: {
      value: particleUv,
      size: 2,
    },
  },
  uniforms: {
    uPositionTexture: 'framebuffer',
    uVelocityTexture: 'framebuffer',
    uTime: 0,
  },
  isDepth: true,
  isTransparent: true,
  isAutoAdd: true,
})

/**
 * framebuffer (float)
 */
;['velocity0', 'velocity1', 'position0', 'position1'].forEach((key) => {
  kgl.createFramebufferFloat(key, width, height)
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
 * reset framebuffer
 */
let loopCount = 0
let targetBufferIndex = loopCount++ % 2
let prevBufferIndex

kgl.bindFramebuffer(`velocity${targetBufferIndex}`)
programResetVelocity.draw()

kgl.bindFramebuffer(`position${targetBufferIndex}`)
programResetPosition.draw()

/**
 * tick
 */
function tick(time) {
  time *= 0.001

  prevBufferIndex = targetBufferIndex
  targetBufferIndex = loopCount++ % 2

  const prevVelocityTexture = `velocity${prevBufferIndex}`
  const prevPositionTexture = `position${prevBufferIndex}`
  const velocityTexture = `velocity${targetBufferIndex}`
  const positionTexture = `position${targetBufferIndex}`

  kgl.bindFramebuffer(velocityTexture)

  programVelocity.updateUniforms({
    uPrevVelocityTexture: prevVelocityTexture,
    uPrevPositionTexture: prevPositionTexture,
  })
  programVelocity.draw()

  kgl.bindFramebuffer(positionTexture)

  programPosition.updateUniforms({
    uPrevPositionTexture: prevPositionTexture,
    uVelocityTexture: velocityTexture,
  })
  programPosition.draw()

  kgl.unbindFramebuffer()
  kgl.clear()

  programMain.updateUniforms({
    uPositionTexture: positionTexture,
    uVelocityTexture: velocityTexture,
    uTime: time,
  })
  programMain.draw()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
