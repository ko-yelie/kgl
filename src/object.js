import {
  createMatrix,
  identity,
  multiply,
  rotate,
  scale,
  translate,
} from './minMatrix.js'

export default class ObjectGl {
  constructor(kgl, option = {}) {
    this.kgl = kgl

    this.mMatrix = createMatrix()
    this.mvpMatrix = createMatrix()
    this.translateValue = [0, 0, 0]
    this.scaleValue = [1, 1, 1]
    this.rotateValue = [0, 0, 0]
    this.widthValue = 1
    this.heightValue = 1
    this.isUpdateMatrixUniform = false

    this.isProgram = false
    this.children = []

    if ('width' in option) {
      this.width = option.width
    }
    if ('height' in option) {
      this.height = option.height
    }
    if ('x' in option) {
      this.x = option.x
    }
    if ('y' in option) {
      this.y = option.y
    }
    if ('z' in option) {
      this.z = option.z
    }
    if ('scale' in option) {
      this.scale = option.scale
    }
    if ('scaleX' in option) {
      this.scaleX = option.scaleX
    }
    if ('scaleY' in option) {
      this.scaleY = option.scaleY
    }
    if ('scaleZ' in option) {
      this.scaleZ = option.scaleZ
    }
    if ('rotateX' in option) {
      this.rotateX = option.rotateX
    }
    if ('rotateY' in option) {
      this.rotateY = option.rotateY
    }
    if ('rotateZ' in option) {
      this.rotateZ = option.rotateZ
    }
    if ('rotate' in option) {
      this.rotate = option.rotate
    }
  }

  get width() {
    return this.widthValue
  }

  set width(value) {
    this.widthValue = value
    this.setIsUpdateMatrix()
  }

  get height() {
    return this.heightValue
  }

  set height(value) {
    this.heightValue = value
    this.setIsUpdateMatrix()
  }

  get x() {
    return this.translateValue[0]
  }

  set x(value) {
    this.translateValue[0] = value
    this.setIsUpdateMatrix()
  }

  get y() {
    return this.translateValue[1]
  }

  set y(value) {
    this.translateValue[1] = value
    this.setIsUpdateMatrix()
  }

  get z() {
    return this.translateValue[2]
  }

  set z(value) {
    this.translateValue[2] = value
    this.setIsUpdateMatrix()
  }

  get scale() {
    return (this.scaleValue[0] === this.scaleValue[1]) === this.scaleValue[2]
      ? this.scaleValue[0]
      : null
  }

  set scale(value) {
    this.scaleValue[0] = this.scaleValue[1] = this.scaleValue[2] = value
    this.setIsUpdateMatrix()
  }

  get scaleX() {
    return this.scaleValue[0]
  }

  set scaleX(value) {
    this.scaleValue[0] = value
    this.setIsUpdateMatrix()
  }

  get scaleY() {
    return this.scaleValue[1]
  }

  set scaleY(value) {
    this.scaleValue[1] = value
    this.setIsUpdateMatrix()
  }

  get scaleZ() {
    return this.scaleValue[2]
  }

  set scaleZ(value) {
    this.scaleValue[2] = value
    this.setIsUpdateMatrix()
  }

  get rotateX() {
    return this.rotateValue[0]
  }

  set rotateX(radian) {
    this.rotateValue[0] = radian
    this.setIsUpdateMatrix()
  }

  get rotateY() {
    return this.rotateValue[1]
  }

  set rotateY(radian) {
    this.rotateValue[1] = radian
    this.setIsUpdateMatrix()
  }

  get rotateZ() {
    return this.rotateValue[2]
  }

  set rotateZ(radian) {
    this.rotateValue[2] = radian
    this.setIsUpdateMatrix()
  }

  get rotate() {
    return this.rotateZ
  }

  set rotate(radian) {
    this.rotateZ = radian
  }

  setIsUpdateMatrix() {
    this.kgl.setIsUpdateMatrix()
  }

  updateMatrix(vpMatrix) {
    identity(this.mMatrix)

    translate(this.mMatrix, this.translateValue, this.mMatrix)

    rotate(this.mMatrix, this.rotateValue[0], [1, 0, 0], this.mMatrix)
    rotate(this.mMatrix, this.rotateValue[1], [0, 1, 0], this.mMatrix)
    rotate(this.mMatrix, this.rotateValue[2], [0, 0, 1], this.mMatrix)

    scale(
      this.mMatrix,
      [
        this.width * this.scaleValue[0],
        this.height * this.scaleValue[1],
        this.scaleValue[2],
      ],
      this.mMatrix
    )

    multiply(vpMatrix, this.mMatrix, this.mvpMatrix)

    if (!this.isProgram && this.children.length > 0) {
      for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
        this.children[i].updateMatrix(this.mvpMatrix)
      }
    }
  }

  add(objectGl) {
    this.children.push(objectGl)
  }

  remove(objectGl) {
    this.children.some((value, i) => {
      if (value === objectGl) {
        this.children.splice(i, 1)
        return true
      }
      return false
    })
  }

  forEachProgram(func) {
    if (this.isProgram) {
      func(this)
    } else {
      for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
        this.children[i].forEachProgram(func)
      }
    }
  }
}
