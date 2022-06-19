export class Vec2 extends Array {
  constructor(initialValues?: [number, number]) {
    if (initialValues) {
      return initialValues
    } else {
      super(2)
    }
  }
}

export class Vec3 extends Array {
  constructor(initialValues?: [number, number, number]) {
    if (initialValues) {
      return initialValues
    } else {
      super(3)
    }
  }
}

export class Vec4 extends Array {
  constructor(initialValues?: [number, number, number, number]) {
    if (initialValues) {
      return initialValues
    } else {
      super(4)
    }
  }
}

export type Matrix = Float32Array
