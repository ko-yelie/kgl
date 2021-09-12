import Program from '../program.js'
import Blur from './blur.js'
import Specular from './specular.js'
import Zoomblur from './zoomblur.js'
import textureFrag from '../shaders/template/texture.frag'

export default class Godray extends Program {
  constructor(kgl) {
    const option = {
      fragmentShader: textureFrag,
      uniforms: {
        uTexture: 'framebuffer',
      },
      isAdditive: true,
    }
    super(kgl, option)

    this.godraySpecular = kgl.createEffect(Specular, {
      threshold: 0.75,
    })

    this.godrayZoomblur = kgl.createEffect(Zoomblur)

    this.godrayBlur = kgl.createEffect(Blur)

    this.godrayBase = kgl.createEffect(Program, {
      fragmentShader: textureFrag,
      uniforms: {
        uTexture: 'framebuffer',
      },
    })

    this.radius = 0.02
  }

  draw(
    readFramebufferKey,
    cacheFramebufferKey,
    outFramebufferKey,
    strength,
    center,
    radius,
    isOnscreen
  ) {
    this.godraySpecular.draw(readFramebufferKey, outFramebufferKey)

    this.godrayZoomblur.draw(
      outFramebufferKey,
      cacheFramebufferKey,
      strength,
      center
    )

    this.godrayBlur.draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.godrayBase
      program.uniforms.uTexture = readFramebufferKey
      program.draw()
    }

    this.uniforms.uTexture = cacheFramebufferKey
    super.draw()
  }
}
