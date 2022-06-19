import { Option as OptionKgl, Framebuffer, OptionCreateProgram } from './kgl'
import KglEffect from './kglEffect'
import Program from './program'
import { EffectInstance, KeyofEffect } from './effects/index'
import * as Effects from './effects/index'

type framebufferOptions = { [K: string]: { width: number; height: number } }

type Option = {
  programs?: { [K: string]: OptionCreateProgram }
  effects?: KeyofEffect[]
  framebuffers?: string[] | framebufferOptions
  framebufferFloats?: framebufferOptions
  tick?: Function
  onBefore?: Function
  onResize?: Function
  isAutoResize?: boolean
  isAutoStart?: boolean
} & OptionKgl

export default class KglAuto extends KglEffect {
  programs: { [K: string]: Program } = {}
  effects: {
    [K: string]: EffectInstance
  } = {}
  framebuffers: { [K: string]: Framebuffer } = {}
  ticks: Function[] = []

  onResize?: Function

  _resize?: EventListener | Function
  requestID: number = 0

  constructor(option: Option = {}) {
    super(option)

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

    if (typeof tick === 'function') {
      this.addTick(tick)
    }
    if (typeof onResize === 'function') {
      this.onResize = onResize
    }

    Object.keys(programs).forEach((key) => {
      const data = programs[key]
      const program = (this.programs[key] = this.createProgram(data))
      if (!data.isFloats) {
        this.add(program)
      }
    })

    effects.forEach((key) => {
      const classKey = (key.charAt(0).toUpperCase() +
        key.slice(1)) as keyof typeof Effects
      this.effects[key] = this.createEffect<EffectInstance>(Effects[classKey])
    })

    if (isAutoResize) {
      this._initResize()
    }

    switch (framebuffers.constructor.name) {
      case 'Array':
        ;(framebuffers as string[]).forEach((key) => {
          this.createFramebuffer(key)
        })
        break
      case 'Object':
        Object.keys(framebuffers).forEach((key) => {
          const { width, height } = (framebuffers as framebufferOptions)[key]
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
    this._resize = () => {
      this.resize()
      if (this.onResize) {
        this.onResize()
      }
    }
    ;(this._resize as Function)()
    window.addEventListener('resize', this._resize as EventListener)
  }

  addTick(tick: Function) {
    this.ticks.push(tick)
  }

  start() {
    let initialTimestamp: number

    requestAnimationFrame((timestamp) => {
      initialTimestamp = timestamp
    })

    const render: FrameRequestCallback = (timestamp) => {
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
    this.requestID = 0
  }

  destroy() {
    this.stop()

    if (this._resize) {
      window.removeEventListener('resize', this._resize as EventListener)
    }

    super.destroy()
  }
}
