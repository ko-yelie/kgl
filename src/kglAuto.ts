import KglEffect from './kglEffect'
import * as Effects from './effects/index'
import Program from './program'
import { Framebuffer } from './kgl'

type Option = {
  programs: { [K: string]: Program }
  effects: (
    | 'blur'
    | 'specular'
    | 'bloom'
    | 'zoomblur'
    | 'godray'
    | 'godrayLight'
  )[]
  framebuffers: string[] | { [K: string]: { width: number; height: number } }
  framebufferFloats: { [K: string]: { width: number; height: number } }
  tick: Function
  onBefore: Function
  onResize: Function
  isAutoResize: boolean
  isAutoStart: boolean
}

export default class KglAuto extends KglEffect {
  programs: { [K: string]: Program } = {}
  effects: {
    [K: string]:
      | Effects.Blur
      | Effects.Specular
      | Effects.Bloom
      | Effects.Zoomblur
      | Effects.Godray
      | Effects.GodrayLight
  } = {}
  framebuffers: { [K: string]: Framebuffer } = {}
  ticks: Function[] = []

  onResize: Function

  _resize?: EventListener
  requestID: number = 0

  constructor(option: Option | {} = {}) {
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
    } = option as Option

    if (typeof tick === 'function') this.addTick(tick)
    this.onResize = onResize

    Object.keys(programs).forEach((key) => {
      const data = programs[key]
      const program = (this.programs[key] = this.createProgram(data))
      if (!(data as any).isFloats) {
        this.add(program)
      }
    })

    effects.forEach((key) => {
      const classKey = (key.charAt(0).toUpperCase() + key.slice(1)) as
        | 'Blur'
        | 'Specular'
        | 'Bloom'
        | 'Zoomblur'
        | 'Godray'
        | 'GodrayLight'
      this.effects[key] = this.createEffect(Effects[classKey])
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
          const { width, height } = (
            framebuffers as { [K: string]: { width: number; height: number } }
          )[key]
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
      window.removeEventListener('resize', this._resize)
    }

    super.destroy()
  }
}
