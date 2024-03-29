import { KglAuto } from '../../../src/index'
import { loadImage, mix } from '../../utils.js'

const image =
  'https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' // https://unsplash.com/photos/Pv5WeEyxMWU
const speed = 0.5
const strength = 12
const maxRadius = window.innerWidth < 768 ? 0.4 : 0.8
const minRadius = 0.1

async function main() {
  const img = await loadImage(image, true)

  new KglAuto({
    programs: {
      mask: {
        fragmentShaderId: 'mask',
        uniforms: {
          uImage: img,
          uImageResolution: [img.width, img.height],
        },
      },
    },
    effects: ['godray'],
    framebuffers: ['mask', 'cache', 'output'],
    tick: (kgl, time) => {
      const cTime = Math.sin(time * speed) * 0.5 + 0.5
      const halfTime = -Math.abs(cTime * 2 - 1) + 1

      kgl.bindFramebuffer('mask')
      kgl.programs.mask.draw()

      kgl.effects.godray.drawEffect(
        'mask',
        'cache',
        'output',
        strength,
        [mix(kgl.canvas.width, 0, cTime), kgl.canvas.height * 0.5],
        mix(maxRadius, minRadius, halfTime),
        true
      )
    },
  })
}
main()
