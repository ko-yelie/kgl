import matIV from './minMatrix.js'

const vertexShaderShape = {
  none: 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}',
  plane: `
    attribute vec3 aPosition;
    attribute vec2 aUv;
    uniform mat4 mvpMatrix;
    varying vec2 vUv;
    void main() {
      vUv = aUv;
      gl_Position = mvpMatrix * vec4(aPosition, 1.);
    }
  `,
}

const attributeNone = {
  aPosition: {
    value: [-1, 1, -1, -1, 1, 1, 1, -1],
    size: 2,
  },
}

function getAttributePlane(width = 1, height = 1) {
  const widthHalf = width / 2
  const heightHalf = height / 2

  return {
    aPosition: {
      value: [
        -widthHalf,
        heightHalf,
        0,
        -widthHalf,
        -heightHalf,
        0,
        widthHalf,
        heightHalf,
        0,
        widthHalf,
        -heightHalf,
        0,
      ],
      size: 3,
    },
    aUv: {
      value: [0, 1, 0, 0, 1, 1, 1, 0],
      size: 2,
    },
  }
}

export default class Program {
  constructor(kgl, option = {}) {
    this.attributes = {}
    this.uniforms = {}
    this.textures = {}
    this.mMatrix = matIV.identity(matIV.create())
    this.mvpMatrix = matIV.identity(matIV.create())
    this.invMatrix = matIV.identity(matIV.create())
    this.translateValue = [0, 0, 0]
    this.scaleValue = [1, 1, 1]
    this.rotateValue = [0, 0, 0]
    this.widthValue = 1
    this.heightValue = 1
    this.isUpdateMatrixUniform = false

    const { gl } = kgl
    this.kgl = kgl
    this.gl = gl

    const {
      shape,
      vertexShaderId,
      vertexShader = vertexShaderId
        ? document.getElementById(vertexShaderId).textContent
        : shape
        ? vertexShaderShape[shape]
        : vertexShaderShape['none'],
      fragmentShaderId,
      fragmentShader = document.getElementById(fragmentShaderId).textContent,
      attributes,
      instancedAttributes,
      uniforms,
      mode,
      drawType = 'STATIC_DRAW',
      isTransparent = false,
      isAdditive = false,
      isFloats = false,
      isCulling = true,
      isDepth = false,
      clearedColor,
    } = option

    const defaultValue = isFloats ? false : true
    const {
      isAutoResolution = uniforms && uniforms.resolution ? false : defaultValue,
      hasCamera = defaultValue,
      hasLight = defaultValue,
      isClear = defaultValue,
    } = option

    const isWhole = !(
      option.shape ||
      option.vertexShaderId ||
      option.vertexShader
    )

    this.mode = mode
    this.glMode = gl[mode || 'TRIANGLE_STRIP']
    this.drawType = drawType
    this.isTransparent = isTransparent
    this.isAdditive = isAdditive
    this.isAutoResolution = isAutoResolution
    this.hasCamera = hasCamera
    this.hasLight = hasLight
    this.isClear = isClear
    this.isCulling = isCulling
    this.isDepth = isDepth
    this.isInstanced = instancedAttributes
    this.clearedColor = clearedColor || [0, 0, 0, 0]

    this.createProgram(vertexShader, fragmentShader)

    this.use()

    if (isWhole) {
      this.createAttribute(attributeNone)
    } else if (shape) {
      switch (shape) {
        case 'plane':
          this.width = option.width
          this.height = option.height
          this.createAttribute(getAttributePlane())
          break
      }
    } else if (attributes) {
      this.createAttribute(attributes)

      if (this.isInstanced) {
        this.instancedArraysExt = gl.getExtension('ANGLE_instanced_arrays')
        if (this.instancedArraysExt == null) {
          alert('ANGLE_instanced_arrays not supported')
          return
        }
        this.createAttribute(instancedAttributes, true)
      }
    }

    if (uniforms) {
      this.createUniform(uniforms)
    }
  }

  createProgram(vertexShader, fragmentShader) {
    const { gl } = this

    const program = gl.createProgram()
    gl.attachShader(
      program,
      (this.vertexShader = this.createShader('VERTEX_SHADER', vertexShader))
    )
    gl.attachShader(
      program,
      (this.fragmentShader = this.createShader(
        'FRAGMENT_SHADER',
        fragmentShader
      ))
    )
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }

    if (!program) {
      console.error(`Failed to create program "${key}".`)
      return
    }

    this.program = program
  }

  createShader(type, content) {
    const { gl } = this
    const shader = gl.createShader(gl[type])

    gl.shaderSource(shader, content)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  createAttribute(data, isInstanced) {
    Object.keys(data).forEach((key) => {
      const { value, size, isIndices } = data[key]

      this.addAttribute(key, value, size, isIndices, isInstanced)
    })
  }

  addAttribute(key, value, size, isIndices, isInstanced) {
    const { gl } = this
    const location = gl.getAttribLocation(this.program, key)
    const attribute = (this.attributes[key] = {
      location,
      size,
      isInstanced,
    })

    if (isIndices) {
      const ibo = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Int16Array(value),
        gl[this.drawType]
      )
      attribute.ibo = ibo

      this.indicesCount = this.indicesCount || value.length
      this.glMode = gl[this.mode || 'TRIANGLES']
    } else {
      const vbo = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl[this.drawType])
      attribute.vbo = vbo

      if (isInstanced) {
        this.instanceCount = this.instanceCount || value.length / size
      }
      this.count = this.count || value.length / size
    }
  }

  setAttribute(key) {
    const { gl } = this
    const { location, size, vbo, ibo, isInstanced } = this.attributes[key]

    if (ibo) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      if (isInstanced)
        this.instancedArraysExt.vertexAttribDivisorANGLE(location, 1)
    }
  }

  updateAttribute(key, values, offset = 0) {
    const { gl } = this

    gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[key].vbo)
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(values))
  }

  get width() {
    return this.widthValue
  }

  set width(value) {
    this.widthValue = value
    this.updateMatrix()
  }

  get height() {
    return this.heightValue
  }

  set height(value) {
    this.heightValue = value
    this.updateMatrix()
  }

  set x(value) {
    this.translateValue[0] = value
    this.updateMatrix()
  }

  set y(value) {
    this.translateValue[1] = value
    this.updateMatrix()
  }

  set z(value) {
    this.translateValue[2] = value
    this.updateMatrix()
  }

  set scale(value) {
    this.scaleValue[0] = this.scaleValue[1] = this.scaleValue[2] = value
    this.updateMatrix()
  }

  set scaleX(value) {
    this.scaleValue[0] = value
    this.updateMatrix()
  }

  set scaleY(value) {
    this.scaleValue[1] = value
    this.updateMatrix()
  }

  set scaleZ(value) {
    this.scaleValue[2] = value
    this.updateMatrix()
  }

  set rotateX(radian) {
    this.rotateValue[0] = radian
    this.updateMatrix()
  }

  set rotateY(radian) {
    this.rotateValue[1] = radian
    this.updateMatrix()
  }

  updateMatrix() {
    this.isUpdateMatrixUniform = true
  }

  updateMatrixUniform() {
    matIV.identity(this.mMatrix)

    matIV.translate(this.mMatrix, this.translateValue, this.mMatrix)

    matIV.rotate(this.mMatrix, this.rotateValue[0], [1, 0, 0], this.mMatrix)
    matIV.rotate(this.mMatrix, this.rotateValue[1], [0, 1, 0], this.mMatrix)

    matIV.scale(
      this.mMatrix,
      [
        this.width * this.scaleValue[0],
        this.height * this.scaleValue[1],
        this.scaleValue[2],
      ],
      this.mMatrix
    )

    matIV.multiply(this.kgl.vpMatrix, this.mMatrix, this.mvpMatrix)
    matIV.inverse(this.mMatrix, this.invMatrix)

    this.uniforms.mvpMatrix = this.mvpMatrix
    this.uniforms.invMatrix = this.invMatrix
  }

  createUniform(data) {
    const mergedData = Object.assign({}, data)

    if (this.isAutoResolution && !mergedData.resolution) {
      mergedData.resolution = [1, 1]
    }
    if (this.hasCamera) {
      mergedData.mvpMatrix = new Float32Array(16)
      mergedData.invMatrix = new Float32Array(16)
    }
    if (this.hasLight) {
      if (!mergedData.lightDirection) mergedData.lightDirection = [0, 0, 0]
      if (!mergedData.eyeDirection) mergedData.eyeDirection = [0, 0, 0]
      if (!mergedData.ambientColor) mergedData.ambientColor = [0.1, 0.1, 0.1]
    }

    Object.keys(mergedData).forEach((key) => {
      this.addUniform(key, mergedData[key])
    })
  }

  addUniform(key, value) {
    let originalType
    let uniformType
    let uniformValue = value

    const getTypeFromString = (type, value) => {
      switch (type) {
        case 'image':
          originalType = 'image'
          uniformType = '1i'
          uniformValue = this.createTexture(key, value)
          break
        case 'framebuffer':
          originalType = 'framebuffer'
          uniformType = '1i'
          uniformValue = value
          break
        default:
          uniformType = type
          uniformValue = value
      }
    }

    switch (typeof value) {
      case 'number':
        uniformType = '1f'
        break
      case 'boolean':
        uniformType = '1i'
        break
      case 'string':
        getTypeFromString(value)
        break
      case 'object':
        switch (value.constructor.name) {
          case 'Float32Array':
          case 'Array':
            switch (value.length) {
              case 16:
                originalType = 'matrix'
                uniformType = 'Matrix4fv'
                break
              default:
                uniformType = `${value.length}fv`
            }
            break
          case 'HTMLImageElement':
          case 'HTMLVideoElement':
          case 'HTMLCanvasElement':
            uniformType = '1i'
            uniformValue = this.createTexture(key, value)
            break
          case 'Object':
            getTypeFromString(value.type, value.value)
            break
        }
        break
    }

    if (!uniformType) {
      console.error(`Failed to add uniform "${key}".`)
      return
    }

    const location = this.gl.getUniformLocation(this.program, key)
    const type = `uniform${uniformType}`

    let set
    switch (originalType) {
      case 'image':
        set = (textureKey) => {
          this.gl[type](location, this.textures[textureKey].textureIndex)
          uniformValue = textureKey
        }
        break
      case 'framebuffer':
        set = (framebufferKey) => {
          this.gl[type](
            location,
            this.kgl.framebuffers[framebufferKey].textureIndex
          )
          uniformValue = framebufferKey
        }
        break
      case 'matrix':
        set = (newValue) => {
          this.gl[type](location, false, newValue)
          uniformValue = newValue
        }
        break
      default:
        set = (newValue) => {
          this.gl[type](location, newValue)
          uniformValue = newValue
        }
    }

    Object.defineProperty(this.uniforms, key, {
      get: () => uniformValue,
      set,
    })

    if (typeof uniformValue !== 'undefined') this.uniforms[key] = uniformValue
  }

  updateUniforms(uniforms) {
    const keys = Object.keys(uniforms)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      this.uniforms[key] = uniforms[key]
    }
  }

  createTexture(key, el) {
    if (!el) return

    const { gl } = this
    const texture = gl.createTexture()
    const textureIndex = ++this.kgl.textureIndex
    this.textures[key] = {
      texture,
      textureIndex,
    }

    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)

    return textureIndex
  }

  updateTexture(key, el) {
    const { gl } = this

    gl.activeTexture(gl[`TEXTURE${this.textures[key].textureIndex}`])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
  }

  use() {
    this.gl.useProgram(this.program)
  }

  draw() {
    const { gl } = this

    this.use()

    if (this.isClear) {
      gl.clearColor(
        this.clearedColor[0],
        this.clearedColor[1],
        this.clearedColor[2],
        this.clearedColor[3]
      )
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    if (this.isTransparent) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    } else if (this.isAdditive) {
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
    } else {
      gl.disable(gl.BLEND)
    }

    if (this.isCulling) gl.enable(gl.CULL_FACE)
    else gl.disable(gl.CULL_FACE)

    if (this.isDepth) gl.enable(gl.DEPTH_TEST)
    else gl.disable(gl.DEPTH_TEST)

    if (this.isUpdateMatrixUniform) {
      this.updateMatrixUniform()
      this.isUpdateMatrixUniform = false
    }

    const keys = Object.keys(this.attributes)
    for (let i = 0; i < keys.length; i++) {
      this.setAttribute(keys[i])
    }

    if (this.isInstanced) {
      if (this.indicesCount) {
        this.instancedArraysExt.drawElementsInstancedANGLE(
          this.glMode,
          this.indicesCount,
          gl.UNSIGNED_SHORT,
          0,
          this.instanceCount
        )
      } else {
        this.instancedArraysExt.drawArraysInstancedANGLE(
          this.glMode,
          0,
          this.count,
          this.instanceCount
        )
      }
    } else {
      if (this.indicesCount) {
        gl.drawElements(this.glMode, this.indicesCount, gl.UNSIGNED_SHORT, 0)
      } else {
        gl.drawArrays(this.glMode, 0, this.count)
      }
    }
  }

  destroy() {
    const { gl } = this

    gl.deleteShader(this.vertexShader)
    gl.deleteShader(this.fragmentShader)

    Object.keys(this.attributes).forEach((key) => {
      const { vbo, ibo } = this.attributes[key]
      gl.deleteBuffer(vbo || ibo)
    })

    Object.keys(this.textures).forEach((key) => {
      const { texture } = this.textures[key]
      gl.deleteTexture(texture)
    })

    gl.deleteProgram(this.program)
  }
}
