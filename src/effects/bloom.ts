import KglEffect from '../kglEffect'
import Program from '../program'
import Specular from './specular'
import Blur from './blur'
import bloomFrag from '../shaders/postprocessing/bloom.frag'

export default class Bloom extends Program {
  bloomSpecular: Specular
  bloomBlur: Blur
  radius = 0.4

  constructor(kgl: KglEffect) {
    const option = {
      fragmentShader: bloomFrag,
      uniforms: {
        uSpecular: 'framebuffer',
        uTextureRead: 'framebuffer',
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
  }

  drawEffect(
    readFramebufferKey: string,
    cacheFramebufferKey: string,
    outFramebufferKey: string,
    radius?: number,
    isOnscreen?: boolean
  ) {
    this.bloomSpecular.drawEffect(readFramebufferKey, cacheFramebufferKey)

    this.bloomBlur.drawEffect(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    this.uniforms.uTextureRead = readFramebufferKey
    this.uniforms.uSpecular = cacheFramebufferKey
    super.draw()
  }
}
