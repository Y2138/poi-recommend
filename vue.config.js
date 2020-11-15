module.exports = {
  configureWebpack: config => {
    // 第三方
    config.externals = {
      AMap: 'AMap'
    }
  }
}