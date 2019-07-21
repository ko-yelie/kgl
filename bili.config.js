module.exports = {
  babel: {
    minimal: true
  },
  banner: require('banner-package'),
  output: {
    moduleName: 'Kgl',
    format: ['es-min', 'iife', 'iife-min'],
    sourceMap: false
  },
  plugins: {
    glslify: true
  }
}
