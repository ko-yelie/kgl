import { KglEffect, Godray } from '../../../src/index'
import fragmentShader from './mask.frag'
import { loadImage, mix } from '../../utils.js'

const image =
  'https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' // https://unsplash.com/photos/Pv5WeEyxMWU
const speed = 0.5
const strength = 12
const maxRadius = window.innerWidth < 768 ? 0.4 : 0.8
const minRadius = 0.1

const kgl = new KglEffect()

async function main() {
  const img = await loadImage(image, true)

  const mask = kgl.createProgram({
    fragmentShader,
    uniforms: {
      uImage: img,
      uImageResolution: [img.width, img.height],
    },
    isAutoAdd: true,
  })

  ;['mask', 'cache', 'output'].forEach((name) => {
    kgl.createFramebuffer(name)
  })

  const godray = kgl.createEffect(Godray)

  /**
   * resize
   */
  function resize() {
    kgl.resize()
  }
  resize()
  window.addEventListener('resize', resize)

  /**
   * tick
   */
  function tick(time) {
    const cTime = Math.sin(time * 0.001 * speed) * 0.5 + 0.5
    const halfTime = -Math.abs(cTime * 2 - 1) + 1

    kgl.bindFramebuffer('mask')
    mask.draw()

    godray.drawEffect(
      'mask',
      'cache',
      'output',
      strength,
      [mix(kgl.canvas.width, 0, cTime), kgl.canvas.height * 0.5],
      mix(maxRadius, minRadius, halfTime),
      true
    )

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
main()
