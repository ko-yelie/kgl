import Kgl from '../../../src/index'
import fragmentShader from './index.frag'
import { loadImage } from '../../utils.js'

const image =
  'https://images.unsplash.com/photo-1631372126726-edb028823784?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' // https://unsplash.com/photos/TfntmeQaK6Q

const kgl = new Kgl()

async function main() {
  /**
   * program
   */
  const img = await loadImage(image, true)

  const program = kgl.createProgram({
    fragmentShader,
    uniforms: {
      uImage: img,
      uImageResolution: [img.width, img.height],
      uTime: 0,
    },
    isAutoAdd: true,
  })

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
    time *= 0.001

    program.uniforms.uTime = time

    kgl.draw()

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
main()
