import Kgl from './kgl.js'

export default class KglAuto extends Kgl {
  constructor(option = {}) {
    super(option)

    this.programs = {}
    this.effects = {}
    this.framebuffers = {}
    this.ticks = []

    const {
      programs = {},
      effects = [],
      framebuffers = [],
      framebufferFloats = {},
      tick,
      onBefore,
      onResize,
      isAutoResize = true,
      isAutoStart = true,
    } = option

    if (typeof tick === 'function') this.addTick(tick)
    this.onResize = onResize

    Object.keys(programs).forEach((key) => {
      this.add((this.programs[key] = this.createProgram(programs[key])))
    })

    effects.forEach((key) => {
      this.createEffect(key)
    })

    if (isAutoResize) {
      this._initResize()
    }

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

    if (isAutoStart) this.start()
  }

  _initResize() {
    this.resize()
    this._resize = this.resize.bind(this)
    window.addEventListener('resize', this._resize)
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
      const time = (timestamp - initialTimestamp) * 0.001

      for (let i = 0; i < this.ticks.length; i++) {
        this.ticks[i](this, time)
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
    window.removeEventListener('resize', this._resize)

    super.destroy()
  }
}
