import Program from '../program'
import blurFrag from '../shaders/postprocessing/blur.frag'

export default class Blur extends Program {
  constructor(kgl) {
    const option = {
      fragmentShader: blurFrag,
      uniforms: {
        uTexture: 'framebuffer',
        uRadius: 0,
        uIsHorizontal: false,
      },
      hasCamera: false,
      hasLight: false,
    }

    super(kgl, option)

    this.radius = 0.5
  }

  draw(readFramebufferKey, cacheFramebufferKey, radius, isOnscreen) {
    const iterations = 8
    for (let i = 0; i < iterations; i++) {
      this.kgl.bindFramebuffer(
        isOnscreen && i >= iterations - 1 ? null : cacheFramebufferKey
      )
      this.uniforms.uTexture = readFramebufferKey
      this.uniforms.uRadius =
        (iterations - 1 - i) *
        (typeof radius !== 'undefined' ? radius : this.radius)
      this.uniforms.uIsHorizontal = i % 2 === 0
      this.kgl.clear()
      super.draw()

      const t = cacheFramebufferKey
      cacheFramebufferKey = readFramebufferKey
      readFramebufferKey = t
    }
    // output: readFramebufferKey
  }
}
