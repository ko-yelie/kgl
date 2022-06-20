import Kgl from '../../../src/index'
import fragmentShader from './index.frag'
import { loadImage } from '../../utils.js'
import image from './1-white-clouds-png-image_400x400.png'

const kgl = new Kgl({
  hasCamera: true,
  isFullSize: true,
})

function createCloud(img) {
  const randomScale = Math.random() * 2

  const program = kgl.createProgram({
    shape: 'plane',
    fragmentShader,
    uniforms: {
      uImage: img,
    },
    isTransparent: true,
    isAutoAdd: true,
    width: img.width,
    height: img.height,
    x: (Math.random() * 2 - 1) * window.innerWidth * 0.5,
    y: (Math.random() * 2 - 1) * window.innerHeight * 0.5,
    // z: randomScale * kgl.cameraPosition[2] * 0.3,
    scale: 1 + randomScale,
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

  const img = await loadImage(image)

  for (let i = 0; i < 10; i++) {
    const program = createCloud(img)
    groupCloud.add(program)
  }

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
    groupCloud.forEachProgram((program) => {
      program.x += 1 * program.scale

      const xMax = window.innerWidth * 0.5 + program.width * program.scale * 0.5
      if (program.x > xMax) {
        program.x = -xMax
      }
    })

    kgl.draw()

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
main()
