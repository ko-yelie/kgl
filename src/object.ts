import Kgl from './kgl'
import {
  createMatrix,
  identity,
  multiply,
  rotate,
  scale,
  translate,
} from './minMatrix'
import { Array2, Array3 } from './type'
import { Matrix, Vec2, Vec3 } from './vector'

export type Option = {
  x?: number
  y?: number
  z?: number
  translate3d?: Vec3
  scale?: number
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  scale2d?: Vec2
  scale3d?: Vec3
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  rotate?: number
  rotate3d?: Vec3
}

export default class ObjectGl {
  isProgram = false
  children: ObjectGl[] = []

  kgl: Kgl

  hasMatrix = true

  mMatrix = createMatrix()
  mvpMatrix = createMatrix()
  _translate = new Vec3([0, 0, 0])
  _scale = new Vec3([1, 1, 1])
  _rotate = new Vec3([0, 0, 0])
  _scalePatch = 1
  isUpdateMatrix = false

  constructor(kgl: Kgl, option: Option = {}, hasMatrix = true) {
    this.kgl = kgl

    this.hasMatrix = hasMatrix
    if (!this.hasMatrix) return

    if ('x' in option) {
      this.x = option.x!
    }
    if ('y' in option) {
      this.y = option.y!
    }
    if ('z' in option) {
      this.z = option.z!
    }
    if ('translate3d' in option) {
      this.translate3d = option.translate3d!
    }
    if ('scale' in option) {
      this.scale = option.scale!
    }
    if ('scaleX' in option) {
      this.scaleX = option.scaleX!
    }
    if ('scaleY' in option) {
      this.scaleY = option.scaleY!
    }
    if ('scaleZ' in option) {
      this.scaleZ = option.scaleZ!
    }
    if ('scale2d' in option) {
      this.scale2d = option.scale2d!
    }
    if ('scale3d' in option) {
      this.scale3d = option.scale3d!
    }
    if ('rotateX' in option) {
      this.rotateX = option.rotateX!
    }
    if ('rotateY' in option) {
      this.rotateY = option.rotateY!
    }
    if ('rotateZ' in option) {
      this.rotateZ = option.rotateZ!
    }
    if ('rotate' in option) {
      this.rotate = option.rotate!
    }
    if ('rotate3d' in option) {
      this.rotate3d = option.rotate3d!
    }
  }

  get x() {
    return this._translate![0]
  }

  set x(value) {
    this._translate![0] = value
    this.changeMatrix()
  }

  get y() {
    return this._translate![1]
  }

  set y(value) {
    this._translate![1] = value
    this.changeMatrix()
  }

  get z() {
    return this._translate![2]
  }

  set z(value) {
    this._translate![2] = value
    this.changeMatrix()
  }

  get translate3d() {
    return this._translate
  }

  set translate3d(value) {
    this._translate![0] = value[0]
    this._translate![1] = value[1]
    this._translate![2] = value[2]
    this.changeMatrix()
  }

  get scale() {
    return this._scale![0] === this._scale![1] &&
      this._scale![0] === this._scale![2]
      ? this._scale![0]
      : 1
  }

  set scale(value) {
    this._scale![0] = this._scale![1] = this._scale![2] = value
    this.changeMatrix()
  }

  get scaleX() {
    return this._scale![0]
  }

  set scaleX(value) {
    this._scale![0] = value
    this.changeMatrix()
  }

  get scaleY() {
    return this._scale![1]
  }

  set scaleY(value) {
    this._scale![1] = value
    this.changeMatrix()
  }

  get scaleZ() {
    return this._scale![2]
  }

  set scaleZ(value) {
    this._scale![2] = value
    this.changeMatrix()
  }

  get scale2d() {
    return this._scale
  }

  set scale2d(value: Vec2 | Array2 | number) {
    if ((value as Vec2 | Array2).length === 2) {
      this._scale![0] = (value as Vec2 | Array2)[0]
      this._scale![1] = (value as Vec2 | Array2)[1]
    } else {
      this._scale![0] = this._scale![1] = value as number
    }
    this.changeMatrix()
  }

  get scale3d() {
    return this._scale
  }

  set scale3d(value: Vec3 | Array3 | number) {
    if ((value as Vec3 | Array3).length === 3) {
      this._scale![0] = (value as Vec3 | Array3)[0]
      this._scale![1] = (value as Vec3 | Array3)[1]
      this._scale![2] = (value as Vec3 | Array3)[2]
    } else {
      this._scale![0] = this._scale![1] = this._scale![2] = value as number
    }
    this.changeMatrix()
  }

  get rotateX() {
    return this._rotate![0]
  }

  set rotateX(radian) {
    this._rotate![0] = radian
    this.changeMatrix()
  }

  get rotateY() {
    return this._rotate![1]
  }

  set rotateY(radian) {
    this._rotate![1] = radian
    this.changeMatrix()
  }

  get rotateZ() {
    return this._rotate![2]
  }

  set rotateZ(radian) {
    this._rotate![2] = radian
    this.changeMatrix()
  }

  get rotate() {
    return this.rotateZ
  }

  set rotate(radian) {
    this.rotateZ = radian
  }

  get rotate3d() {
    return this._rotate
  }

  set rotate3d(radian) {
    this._rotate![0] = radian[0]
    this._rotate![1] = radian[1]
    this._rotate![2] = radian[2]
    this.changeMatrix()
  }

  get scalePatch() {
    return this._scalePatch
  }

  set scalePatch(value) {
    this._scalePatch = value
    this.changeMatrix()
  }

  changeMatrix() {
    if (this.isUpdateMatrix) return

    this.kgl.setIsUpdateMatrix()
  }

  setIsUpdateMatrix() {
    if (!this.hasMatrix) return
    this.isUpdateMatrix = true

    if (!this.isProgram) {
      for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
        this.children[i].setIsUpdateMatrix()
      }
    }
  }

  updateMatrix(vpMatrix: Matrix) {
    if (!this.hasMatrix) return

    const { isUpdateMatrix } = this

    if (isUpdateMatrix) {
      identity(this.mMatrix!)

      translate(
        this.mMatrix!,
        [
          this._translate![0] * this.kgl.pixelRatio,
          this._translate![1] * this.kgl.pixelRatio,
          this._translate![2],
        ],
        this.mMatrix!
      )

      rotate(this.mMatrix!, this._rotate![0], [1, 0, 0], this.mMatrix!)
      rotate(this.mMatrix!, this._rotate![1], [0, 1, 0], this.mMatrix!)
      rotate(this.mMatrix!, this._rotate![2], [0, 0, 1], this.mMatrix!)

      scale(
        this.mMatrix!,
        [
          this._scale![0] * this._scalePatch!,
          this._scale![1] * this._scalePatch!,
          this._scale![2] * this._scalePatch!,
        ],
        this.mMatrix!
      )

      multiply(vpMatrix, this.mMatrix!, this.mvpMatrix!)

      if (!this.isProgram) {
        for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
          this.children[i].updateMatrix(this.mvpMatrix!)
        }
      }

      this.isUpdateMatrix = false
    }

    return isUpdateMatrix
  }

  add(objectGl: ObjectGl) {
    this.children.push(objectGl)
  }

  remove(objectGl: ObjectGl) {
    this.children.some((value, i) => {
      if (value === objectGl) {
        this.children.splice(i, 1)
        return true
      }
      return false
    })
  }

  draw() {
    if (this.children.length > 0) {
      for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
        this.children[i].draw()
      }
    }
  }

  forEachProgram(func: Function) {
    if (this.isProgram) {
      func(this)
    } else {
      for (let i = 0; i < this.children.length; i = (i + 1) | 0) {
        this.children[i].forEachProgram(func)
      }
    }
  }
}
