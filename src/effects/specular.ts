import KglEffect from '../kglEffect'
import Program from '../program'
import specularFrag from '../shaders/postprocessing/specular.frag'

type Option = {
  threshold?: number
}

export default class Specular extends Program {
  constructor(kgl: KglEffect, option: Option = {}) {
    const { threshold = 0.5 } = option

    const programOption = {
      fragmentShader: specularFrag,
      uniforms: {
        uTexture: 'framebuffer',
        uThreshold: threshold,
      },
      hasCamera: false,
      hasLight: false,
    }

    super(kgl, programOption)
  }

  drawEffect(
    readFramebufferKey: string,
    outFramebufferKey: string,
    threshold?: number
  ) {
    this.kgl.bindFramebuffer(outFramebufferKey)
    this.uniforms.uTexture = readFramebufferKey
    if (typeof threshold !== 'undefined') this.uniforms.uThreshold = threshold
    this.kgl.clear()
    super.draw()
  }
}
