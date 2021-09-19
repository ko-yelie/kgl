const path = require('path')
const pkg = require(path.resolve(process.cwd(), 'package.json'))

const NAME = 'KGL'
const banner = `/*!
 * ${NAME || pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * @license ${pkg.license}
 * Copyright ${pkg.author}
 */`

module.exports = {
  babel: {
    minimal: true,
  },
  banner,
  output: {
    moduleName: 'Kgl',
    format: ['es', 'iife', 'iife-min'],
    sourceMap: false,
  },
  plugins: {
    replace: { preventAssignment: true },
    glslify: true,
  },
}
