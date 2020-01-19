const noneVert = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}'
const noneAttribute = {
  position: {
    value: [-1, 1, -1, -1, 1, 1, 1, -1],
    size: 2
  }
}

export default class Program {
  constructor (webgl, option) {
    this.attributes = {}
    this.uniforms = {}
    this.textureIndexes = {}

    const { gl } = webgl
    this.webgl = webgl

    const {
      vertexShaderId,
      vertexShader = vertexShaderId ? document.getElementById(vertexShaderId).textContent : noneVert,
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
      clearedColor
    } = option

    const defaultValue = isFloats ? false : true
    const {
      isAutoResolution = uniforms && uniforms.resolution ? false : defaultValue,
      hasCamera = defaultValue,
      hasLight = defaultValue,
      isClear = defaultValue
    } = option

    const isWhole = !(option.vertexShaderId || option.vertexShader)

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
      this.createWholeAttribute()
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

    if (uniforms) this.createUniform(uniforms)
  }

  createProgram (vertexShader, fragmentShader) {
    const { gl } = this.webgl

    const program = gl.createProgram()
    gl.attachShader(program, this.createShader('VERTEX_SHADER', vertexShader))
    gl.attachShader(program, this.createShader('FRAGMENT_SHADER', fragmentShader))
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

  createShader (type, content) {
    const { gl } = this.webgl
    const shader = gl.createShader(gl[type])

    gl.shaderSource(shader, content)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  createAttribute (data, isInstanced) {
    Object.keys(data).forEach(key => {
      const { value, size, isIndices } = data[key]

      this.addAttribute(key, value, size, isIndices, isInstanced)
    })
  }

  addAttribute (key, value, size, isIndices, isInstanced) {
    const { gl } = this.webgl
    const location = gl.getAttribLocation(this.program, key)
    const attribute = this.attributes[key] = {
      location,
      size,
      isInstanced
    }

    if (isIndices) {
      const ibo = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(value), gl[this.drawType])
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

  setAttribute (key) {
    const { gl } = this.webgl
    const { location, size, vbo, ibo, isInstanced } = this.attributes[key]

    if (ibo) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      if (isInstanced) this.instancedArraysExt.vertexAttribDivisorANGLE(location, 1)
    }
  }

  updateAttribute (key, values, offset = 0) {
    const { gl } = this.webgl

    gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[key].vbo)
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(values))
  }

  createWholeAttribute () {
    this.createAttribute(noneAttribute)
  }

  createUniform (data) {
    const mergedData = Object.assign({}, data)

    if (this.isAutoResolution && !mergedData.resolution) mergedData.resolution = [1, 1]
    if (this.hasCamera) {
      mergedData.mvpMatrix = new Float32Array(16)
      mergedData.invMatrix = new Float32Array(16)
    }
    if (this.hasLight) {
      if (!mergedData.lightDirection) mergedData.lightDirection = [0, 0, 0]
      if (!mergedData.eyeDirection) mergedData.eyeDirection = [0, 0, 0]
      if (!mergedData.ambientColor) mergedData.ambientColor = [0.1, 0.1, 0.1]
    }

    Object.keys(mergedData).forEach(key => {
      this.addUniform(key, mergedData[key])
    })
  }

  addUniform (key, value) {
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

    const location = this.webgl.gl.getUniformLocation(this.program, key)
    const type = `uniform${uniformType}`

    let set
    switch (originalType) {
      case 'image':
        set = textureKey => {
          this.webgl.gl[type](location, this.textureIndexes[textureKey])
          uniformValue = textureKey
        }
        break
      case 'framebuffer':
        set = framebufferKey => {
          this.webgl.gl[type](location, this.webgl.framebuffers[framebufferKey].textureIndex)
          uniformValue = framebufferKey
        }
        break
      case 'matrix':
        set = newValue => {
          this.webgl.gl[type](location, false, newValue)
          uniformValue = newValue
        }
        break
      default:
        set = newValue => {
          this.webgl.gl[type](location, newValue)
          uniformValue = newValue
        }
    }

    Object.defineProperty(this.uniforms, key, {
      get: () => uniformValue,
      set
    })

    if (typeof uniformValue !== 'undefined') this.uniforms[key] = uniformValue
  }

  createTexture (key, el) {
    if (!el) return

    const { gl } = this.webgl
    const texture = gl.createTexture()
    const textureIndex = this.textureIndexes[key] = ++this.webgl.textureIndex

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

  updateTexture (key, el) {
    const { gl } = this.webgl

    gl.activeTexture(gl[`TEXTURE${this.textureIndexes[key]}`])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
  }

  use () {
    this.webgl.gl.useProgram(this.program)
  }

  draw (uniforms) {
    const { gl } = this.webgl

    this.use()

    if (this.isClear) {
      gl.clearColor(this.clearedColor[0], this.clearedColor[1], this.clearedColor[2], this.clearedColor[3])
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

    if (uniforms) {
      const keys = Object.keys(uniforms)
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        this.uniforms[key] = uniforms[key]
      }
    }

    const keys = Object.keys(this.attributes)
    for (let index = 0; index < keys.length; index++) {
      this.setAttribute(keys[index])
    }

    if (this.isInstanced) {
      if (this.indicesCount) {
        this.instancedArraysExt.drawElementsInstancedANGLE(this.glMode, this.indicesCount, gl.UNSIGNED_SHORT, 0, this.instanceCount)
      } else {
        this.instancedArraysExt.drawArraysInstancedANGLE(this.glMode, 0, this.count, this.instanceCount)
      }
    } else {
      if (this.indicesCount) {
        gl.drawElements(this.glMode, this.indicesCount, gl.UNSIGNED_SHORT, 0)
      } else {
        gl.drawArrays(this.glMode, 0, this.count)
      }
    }
  }
}
