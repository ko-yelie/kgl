import KglEffect from '../kglEffect'
import Program from '../program'
import Blur from './blur'
import Specular from './specular'
import Zoomblur from './zoomblur'
import textureFrag from '../shaders/template/texture.frag'
import { Array2 } from '../type'

export default class GodrayLight extends Program {
  godraySpecular: Specular
  godrayZoomblur: Zoomblur
  godrayBlur: Blur
  radius = 0.02

  constructor(kgl: KglEffect) {
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
  }

  drawEffect(
    readFramebufferKey: string,
    cacheFramebufferKey: string,
    outFramebufferKey: string,
    strength?: number,
    center?: Array2,
    radius?: number,
    isOnscreen?: boolean
  ) {
    this.godraySpecular.drawEffect(readFramebufferKey, outFramebufferKey)

    this.godrayZoomblur.drawEffect(
      outFramebufferKey,
      cacheFramebufferKey,
      strength,
      center
    )

    this.godrayBlur.drawEffect(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    this.uniforms.uTexture = cacheFramebufferKey
    super.draw()
  }
}
