import Program from './program'
import textureFrag from './shaders/template/texture.frag'
import blurFrag from './shaders/postprocessing/blur.frag'
import specularFrag from './shaders/postprocessing/specular.frag'
import bloomFrag from './shaders/postprocessing/bloom.frag'
import zoomblurFrag from './shaders/postprocessing/zoomblur.frag'

export class Blur extends Program {
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

export class Specular extends Program {
  constructor(kgl, option = {}) {
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

  draw(readFramebufferKey, outFramebufferKey, threshold) {
    this.kgl.bindFramebuffer(outFramebufferKey)
    this.uniforms.uTexture = readFramebufferKey
    if (typeof threshold !== 'undefined') this.uniforms.uThreshold = threshold
    this.kgl.clear()
    super.draw()
  }
}

export class Bloom extends Program {
  constructor(kgl) {
    if (!kgl.effects.bloomSpecular) {
      kgl.effects.bloomSpecular = new Specular(kgl, {
        threshold: 0.3,
      })
    }

    if (!kgl.effects.bloomBlur) {
      kgl.effects.bloomBlur = new Blur(kgl)
    }

    if (!kgl.effects.bloomBase) {
      kgl.effects.bloomBase = new Program(kgl, {
        fragmentShader: textureFrag,
        uniforms: {
          uTexture: 'framebuffer',
        },
      })
    }

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

    this.radius = 0.4
  }

  draw(
    readFramebufferKey,
    cacheFramebufferKey,
    outFramebufferKey,
    radius,
    isOnscreen
  ) {
    this.kgl.effects.bloomSpecular.draw(readFramebufferKey, cacheFramebufferKey)

    this.kgl.effects.bloomBlur.draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.kgl.effects.bloomBase
      program.uniforms.uTexture = readFramebufferKey
      program.draw()
    }

    this.uniforms.uSpecular = cacheFramebufferKey
    super.draw()
  }
}

export class Zoomblur extends Program {
  constructor(kgl) {
    const option = {
      fragmentShader: zoomblurFrag,
      uniforms: {
        uTexture: 'framebuffer',
        uStrength: 5,
        uCenter: [kgl.canvas.width / 2, kgl.canvas.height / 2],
      },
    }
    super(kgl, option)
  }

  draw(readFramebufferKey, outFramebufferKey, strength, center, isOnscreen) {
    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)
    this.uniforms.uTexture = readFramebufferKey
    if (typeof strength !== 'undefined') this.uniforms.uStrength = strength
    if (typeof center !== 'undefined') this.uniforms.uCenter = center
    this.kgl.clear()
    super.draw()
  }
}

export class Godray extends Program {
  constructor(kgl) {
    if (!kgl.effects.godraySpecular) {
      kgl.effects.godraySpecular = new Specular(kgl, {
        threshold: 0.75,
      })
    }

    if (!kgl.effects.godrayZoomblur) {
      kgl.effects.godrayZoomblur = new Zoomblur(kgl)
    }

    if (!kgl.effects.godrayBlur) {
      kgl.effects.godrayBlur = new Blur(kgl)
    }

    if (!kgl.effects.godrayBase) {
      kgl.effects.godrayBase = new Program(kgl, {
        fragmentShader: textureFrag,
        uniforms: {
          uTexture: 'framebuffer',
        },
      })
    }

    const option = {
      fragmentShader: textureFrag,
      uniforms: {
        uTexture: 'framebuffer',
      },
      isAdditive: true,
    }
    super(kgl, option)

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
    this.kgl.effects.godraySpecular.draw(readFramebufferKey, outFramebufferKey)

    this.kgl.effects.godrayZoomblur.draw(
      outFramebufferKey,
      cacheFramebufferKey,
      strength,
      center
    )

    this.kgl.effects.godrayBlur.draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.kgl.effects.godrayBase
      program.uniforms.uTexture = readFramebufferKey
      program.draw()
    }

    this.uniforms.uTexture = cacheFramebufferKey
    super.draw()
  }
}

export class GodrayLight extends Program {
  constructor(kgl) {
    if (!kgl.effects.godraySpecular) {
      kgl.effects.godraySpecular = new Specular(kgl, {
        threshold: 0.75,
      })
    }

    if (!kgl.effects.godrayZoomblur) {
      kgl.effects.godrayZoomblur = new Zoomblur(kgl)
    }

    if (!kgl.effects.godrayBlur) {
      kgl.effects.godrayBlur = new Blur(kgl)
    }

    const option = {
      fragmentShader: textureFrag,
      uniforms: {
        uTexture: 'framebuffer',
      },
      isAdditive: true,
    }
    super(kgl, option)

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
    this.kgl.effects.godraySpecular.draw(readFramebufferKey, outFramebufferKey)

    this.kgl.effects.godrayZoomblur.draw(
      outFramebufferKey,
      cacheFramebufferKey,
      strength,
      center
    )

    this.kgl.effects.godrayBlur.draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    this.uniforms.uTexture = cacheFramebufferKey
    super.draw()
  }
}
