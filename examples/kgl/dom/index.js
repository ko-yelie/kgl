import Kgl from '../../../src/index'
import fragmentShader from './index.frag'
import { onLoadImage } from '../../utils.js'

const kgl = new Kgl({
  canvas: 'canvas',
  hasCamera: true,
  isFullSize: true,
})

function createImage(img) {
  const { width, height, top, left } = img.getBoundingClientRect()

  const program = kgl.createProgram({
    shape: 'plane',
    fragmentShader,
    uniforms: {
      uImage: img,
      uImageResolution: [width, height],
      uScrollDiff: 0,
    },
    isTransparent: true,
    isAutoAdd: true,
    width: width,
    height: height * 2,
    x: left - (window.innerWidth * 0.5 - width * 0.5),
    y: -(top + window.scrollY - (window.innerHeight * 0.5 - height * 0.5)),
  })

  return program
}

async function main() {
  /**
   * program
   */
  const groupCloud = kgl.createGroup({
    isAutoAdd: true,
  })

  document.querySelectorAll('.image').forEach(async (img) => {
    await onLoadImage(img)
    const program = createImage(img)
    groupCloud.add(program)
  })

  /**
   * scroll
   */
  let scrollPrev = 0
  let scrollDiff = 0
  let scrollDiffSmooth = 0
  let timerId
  function scroll() {
    groupCloud.y = window.scrollY

    scrollDiff = window.scrollY - scrollPrev
    scrollPrev = window.scrollY

    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      scrollDiff = 0
    }, 300)
  }
  scroll()
  window.addEventListener('scroll', scroll)

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
    scrollDiffSmooth += (scrollDiff - scrollDiffSmooth) * 0.07
    if (Math.abs(scrollDiff - scrollDiffSmooth) < 0.01) {
      scrollDiffSmooth = scrollDiff
    }

    groupCloud.forEachProgram((program) => {
      program.uniforms.uScrollDiff = scrollDiffSmooth * 0.005
    })

    kgl.draw()

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
main()
