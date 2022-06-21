import Kgl from '../../../src/index'
import fragmentShader from './index.frag'
import { onLoadImage } from '../../utils.js'

const kgl = new Kgl({
  canvas: '.canvas',
  hasCamera: true,
  isFullSize: true,
})

async function main() {
  /**
   * program
   */
  const img = await onLoadImage(document.querySelector('.image'))

  const program = kgl.createProgram({
    shape: 'plane',
    fragmentShader,
    uniforms: {
      uImage: img,
      uTime: 0,
    },
    isTransparent: true,
    isAutoAdd: true,
  })

  /**
   * resize
   */
  function resize() {
    kgl.resize()

    const { width, height, top, left } = img.getBoundingClientRect()

    program.scale2d = [width, height]
    program.x = left - (window.innerWidth * 0.5 - width * 0.5)
    program.y = -(
      top +
      window.scrollY -
      (window.innerHeight * 0.5 - height * 0.5)
    )
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
