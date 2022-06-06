import Program from '../program'
import Specular from './specular.js'
import Blur from './blur.js'
import textureFrag from '../shaders/template/texture.frag'
import bloomFrag from '../shaders/postprocessing/bloom.frag'

export default class Bloom extends Program {
  constructor(kgl) {
    const option = {
      fragmentShader: bloomFrag,
      uniforms: {
        uSpecular: 'framebuffer',
      },
      isAdditive: true,
      hasCamera: false,
      hasLight: false,
    }
    super(kgl, option)

    this.bloomSpecular = kgl.createEffect(Specular, {
      threshold: 0.3,
    })

    this.bloomBlur = kgl.createEffect(Blur)

    this.bloomBase = kgl.createEffect(Program, {
      fragmentShader: textureFrag,
      uniforms: {
        uTexture: 'framebuffer',
      },
    })

    this.radius = 0.4
  }

  draw(
    readFramebufferKey,
    cacheFramebufferKey,
    outFramebufferKey,
    radius,
    isOnscreen
  ) {
    this.bloomSpecular.draw(readFramebufferKey, cacheFramebufferKey)

    this.bloomBlur.draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.bloomBase
      program.uniforms.uTexture = readFramebufferKey
      program.draw()
    }

    this.uniforms.uSpecular = cacheFramebufferKey
    super.draw()
  }
}
