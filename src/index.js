import matIV from './minMatrix.js'
import Program from './program'
import * as effects from './effects'

export default class Kgl {
  constructor(option) {
    this.programs = {}
    this.effects = {}
    this.framebuffers = {}
    this.textureIndex = -1
    this.ticks = []
    this.vMatrix = matIV.identity(matIV.create())
    this.pMatrix = matIV.identity(matIV.create())
    this.vpMatrix = matIV.identity(matIV.create())

    const {
      canvas,
      fov = 50,
      near = 0.1,
      far = 2000,
      cameraPosition = [0, 0, 30],
      cameraRotation = [0, 0],
      lightDirection = [-1, 1, 1],
      eyeDirection = cameraPosition,
      ambientColor = [0.1, 0.1, 0.1],
      isClear = false,
      clearedColor,
      programs = {},
      effects = [],
      framebuffers = [],
      framebufferFloats = {},
      tick,
      onBefore,
      onResize,
      isAutoStart = true,
    } = option

    this._initWebgl(canvas)

    this.fov = fov
    this.near = near
    this.far = far
    this.cameraPosition = cameraPosition
    this.cameraRotation = cameraRotation

    this.isAutoUpdateCameraPositionZ =
      typeof option.cameraPosition === 'undefined'

    this.lightDirection = lightDirection
    this.eyeDirection = eyeDirection
    this.ambientColor = ambientColor

    if (typeof tick === 'function') this.addTick(tick)
    this.onResize = onResize
    this.isClear = isClear
    this.clearedColor = this.isClear ? clearedColor || [0, 0, 0, 0] : null

    Object.keys(programs).forEach((key) => {
      this.createProgram(key, programs[key])
    })

    effects.forEach((key) => {
      this.createEffect(key)
    })

    this._initSize()

    switch (framebuffers.constructor.name) {
      case 'Array':
        framebuffers.forEach((key) => {
          this.createFramebuffer(key)
        })
        break
      case 'Object':
        Object.keys(framebuffers).forEach((key) => {
          const { width, height } = framebuffers[key]
          this.createFramebuffer(key, width, height)
        })
        break
    }

    Object.keys(framebufferFloats).forEach((key) => {
      const { width, height } = framebufferFloats[key]
      this.createFramebufferFloat(key, width, height)
    })

    if (typeof onBefore === 'function') onBefore(this)

    if (isAutoStart && tick) this.start()
  }

  _initWebgl(canvas) {
    if (typeof canvas === 'string') {
      this.canvas = document.querySelector(canvas)
    } else if (
      typeof canvas === 'object' &&
      canvas.constructor.name === 'HTMLCanvasElement'
    ) {
      this.canvas = canvas
    } else {
      this.canvas = document.createElement('canvas')
      this.canvas.style.display = 'block'
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      document.body.appendChild(this.canvas)
    }

    const gl = (this.gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl'))

    gl.depthFunc(gl.LEQUAL)
  }

  createProgram(key, option) {
    this.programs[key] = new Program(this, option)
  }

  createEffect(key) {
    const classKey = key.charAt(0).toUpperCase() + key.slice(1)
    this.effects[key] = new effects[classKey](this)
  }

  createFramebuffer(
    key,
    width = this.canvas.width,
    height = this.canvas.height
  ) {
    const { gl } = this

    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    const depthRenderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthRenderBuffer
    )
    const texture = gl.createTexture()
    const textureIndex = ++this.textureIndex
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.framebuffers[key] = {
      framebuffer,
      textureIndex,
      depthRenderBuffer,
    }
  }

  resizeFramebuffer(
    key,
    width = this.canvas.width,
    height = this.canvas.height
  ) {
    const { gl } = this
    const { framebuffer, textureIndex, depthRenderBuffer, isFloat } =
      this.framebuffers[key]
    if (isFloat) return

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthRenderBuffer
    )
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
  }

  createFramebufferFloat(key, width, height = width) {
    const { gl } = this
    const textureFloat = gl.getExtension('OES_texture_float')
    const textureHalfFloat = gl.getExtension('OES_texture_half_float')

    if (!(textureFloat || textureHalfFloat)) {
      console.error('float texture not support')
      return
    }

    const flg = textureFloat ? gl.FLOAT : textureHalfFloat.HALF_FLOAT_OES
    const framebuffer = gl.createFramebuffer()
    const texture = gl.createTexture()
    const textureIndex = ++this.textureIndex

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      flg,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.framebuffers[key] = {
      framebuffer,
      textureIndex,
      isFloat: true,
    }
  }

  bindFramebuffer(key) {
    const { gl } = this

    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      key ? this.framebuffers[key].framebuffer : null
    )
  }

  unbindFramebuffer() {
    const { gl } = this

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  setSize() {
    const { gl } = this
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    this.canvas.width = width
    this.canvas.height = height
    this.aspect = width / height

    gl.viewport(0, 0, width, height)

    Object.keys(this.programs).forEach((key) => {
      const program = this.programs[key]
      if (program.isAutoResolution) {
        program.use()
        program.uniforms.resolution = [width, height]
      }
    })

    Object.keys(this.effects).forEach((key) => {
      const program = this.effects[key]
      if (program.isAutoResolution) {
        program.use()
        program.uniforms.resolution = [width, height]
      }
    })

    Object.keys(this.framebuffers).forEach((key) => {
      this.resizeFramebuffer(key)
    })

    this.updateCamera()
    this.updateLight()

    if (typeof this.onResize === 'function') this.onResize(this)
  }

  _initSize() {
    this.setSize()
    this._setSize = () => {
      this.setSize()
    }
    window.addEventListener('resize', this._setSize)
  }

  updateCamera() {
    const {
      fov,
      near,
      far,
      cameraPosition,
      cameraRotation,
      vMatrix,
      pMatrix,
      vpMatrix,
    } = this
    const cameraPositionRate = 0.3

    // cameraPosition[0] += (pointer.x * cameraPositionRate - cameraPosition[0]) * 0.1
    // cameraPosition[1] += (pointer.y * cameraPositionRate - cameraPosition[1]) * 0.1
    if (this.isAutoUpdateCameraPositionZ) {
      cameraPosition[2] =
        Math.min(this.canvas.width, this.canvas.height) /
        2 /
        Math.tan((this.fov / 2) * (Math.PI / 180))
    } else {
      // cameraPosition[2] += (settings.zPosition - cameraPosition[2]) * 0.1
    }
    this.eyeDirection = cameraPosition

    matIV.lookAt(
      cameraPosition,
      [cameraPosition[0], cameraPosition[1], 0],
      [0, 1, 0],
      vMatrix
    )
    matIV.perspective(fov, this.aspect, near, far, pMatrix)

    cameraRotation[0] = cameraRotation[0] % (Math.PI * 2)
    cameraRotation[1] = cameraRotation[1] % (Math.PI * 2)
    matIV.rotate(vMatrix, cameraRotation[0], [0, 1, 0], vMatrix)
    matIV.rotate(vMatrix, cameraRotation[1], [-1, 0, 0], vMatrix)

    matIV.multiply(pMatrix, vMatrix, vpMatrix)

    Object.keys(this.programs).forEach((key) => {
      const program = this.programs[key]
      if (program.hasCamera) {
        program.updateMatrix()
      }
    })
  }

  updateLight() {
    const { lightDirection, eyeDirection, ambientColor } = this

    Object.keys(this.programs).forEach((key) => {
      const program = this.programs[key]
      if (program.hasLight) {
        program.use()
        program.uniforms.lightDirection = lightDirection
        program.uniforms.eyeDirection = eyeDirection
        program.uniforms.ambientColor = ambientColor
      }
    })
  }

  clear() {
    if (!this.isClear) return

    const { gl } = this
    gl.clearColor(
      this.clearedColor[0],
      this.clearedColor[1],
      this.clearedColor[2],
      this.clearedColor[3]
    )
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  drawAll() {
    this.clear()

    Object.keys(this.programs).forEach((key) => {
      this.programs[key].draw()
    })
  }

  addTick(tick) {
    this.ticks.push(tick)
  }

  start() {
    let initialTimestamp

    requestAnimationFrame((timestamp) => {
      initialTimestamp = timestamp
    })

    const render = (timestamp) => {
      const time = (timestamp - initialTimestamp) / 1000

      this.clear()

      for (let index = 0; index < this.ticks.length; index++) {
        this.ticks[index](this, time)
      }

      this.requestID = requestAnimationFrame(render)
    }
    this.requestID = requestAnimationFrame(render)
  }

  stop() {
    if (!this.requestID) return

    cancelAnimationFrame(this.requestID)
    this.requestID = null
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this._setSize)
  }
}
