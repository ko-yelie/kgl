import { KglAuto } from '../../../src/index.js'
import resetVelocityFrag from '../../kgl/instancing/shaders/reset-velocity.frag'
import resetPositionFrag from '../../kgl/instancing/shaders/reset-position.frag'
import velocityFrag from '../../kgl/instancing/shaders/velocity.frag'
import positionFrag from '../../kgl/instancing/shaders/position.frag'
import mainVert from '../../kgl/instancing/shaders/main.vert'
import mainFrag from '../../kgl/instancing/shaders/main.frag'

const width = 100
const height = 100

const sizeUniform = [width, height]
const particleUv = []

for (let i = 0; i < width; i++) {
  for (let j = 0; j < height; j++) {
    particleUv.push(i / (width - 1), 1 - j / (height - 1))
  }
}

let loopCount = 0
let targetBufferIndex = loopCount++ % 2
let prevBufferIndex

new KglAuto({
  clearedColor: [0, 0, 0, 1],
  hasCamera: true,
  hasLight: true,
  cameraPosition: [0, 0, 480],
  fov: 50,
  programs: {
    resetVelocity: {
      fragmentShader: resetVelocityFrag,
      isFloats: true,
    },
    resetPosition: {
      fragmentShader: resetPositionFrag,
      uniforms: {
        uSize: sizeUniform,
      },
      isFloats: true,
    },
    velocity: {
      fragmentShader: velocityFrag,
      uniforms: {
        uSize: sizeUniform,
        uPrevVelocityTexture: 'framebuffer',
        uPrevPositionTexture: 'framebuffer',
      },
      isFloats: true,
    },
    position: {
      fragmentShader: positionFrag,
      uniforms: {
        uSize: sizeUniform,
        uPrevPositionTexture: 'framebuffer',
        uVelocityTexture: 'framebuffer',
      },
      isFloats: true,
    },
    main: {
      shape: 'cube',
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
    },
  },
  framebufferFloats: {
    velocity0: {
      width,
      height,
    },
    velocity1: {
      width,
      height,
    },
    position0: {
      width,
      height,
    },
    position1: {
      width,
      height,
    },
  },
  onBefore: (kgl) => {
    kgl.bindFramebuffer('velocity' + targetBufferIndex)
    kgl.programs.resetVelocity.draw()

    kgl.bindFramebuffer('position' + targetBufferIndex)
    kgl.programs.resetPosition.draw()
  },
  tick: (kgl, time) => {
    prevBufferIndex = targetBufferIndex
    targetBufferIndex = loopCount++ % 2

    const prevVelocityTexture = `velocity${prevBufferIndex}`
    const prevPositionTexture = `position${prevBufferIndex}`
    const velocityTexture = `velocity${targetBufferIndex}`
    const positionTexture = `position${targetBufferIndex}`

    kgl.bindFramebuffer(velocityTexture)

    kgl.programs.velocity.updateUniforms({
      uPrevVelocityTexture: prevVelocityTexture,
      uPrevPositionTexture: prevPositionTexture,
    })
    kgl.programs.velocity.draw()

    kgl.bindFramebuffer(positionTexture)

    kgl.programs.position.updateUniforms({
      uPrevPositionTexture: prevPositionTexture,
      uVelocityTexture: velocityTexture,
    })
    kgl.programs.position.draw()

    kgl.unbindFramebuffer()
    kgl.clear()

    kgl.programs.main.updateUniforms({
      uPositionTexture: positionTexture,
      uVelocityTexture: velocityTexture,
      uTime: time,
    })
    kgl.programs.main.draw()
  },
})
