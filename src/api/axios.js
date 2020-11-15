import Axios from 'axios'

// let envCode = 'qa.'
// const base_url = `http://gtw-wx.${envCode}enmonster.com`

// const base_url = `http://10.208.201.170:8888/gs03` //本地
const base_url = `http://dkfsbd.emmars.net/gs03`

const service = Axios.create({
  baseURL: base_url, // 基础url
  timeout: 10000, // 请求超时时间
})

// 设置请求拦截器
service.interceptors.request.use((config) => {
  console.log('请求config', config)
  // config.headers["Content-type"] = 'application/json;charset=UTF-8'
  // config.headers["Auth"] = getCookie(tokenName) // 当前cookie 用户 token
  // config.headers['return-uri'] = getCurrentUrl() // 当前页面url
  // config.headers['sysType'] = 1
  return config
}, (error) => {
  console.log('请求错误： ', error)
})

// 设置接口返回拦截器(可以对当前用户登录状态变更时进行操作)
service.interceptors.response.use((response) => {
  return Promise.resolve(response.data)
}, error => {
  // 请求被取消
  console.log('请求被取消： ', error)
})

export default {
  install (Vue) {
    // 设置post请求
    Vue.prototype.axiosPost = function (url, data, call) {
      return service({
        url: url, // 请求url
        method: 'post', // 请求方法
        data: data || {}, // 入参
        callback: call || '', // 回调函数
      })
    }
    Vue.prototype.axiosGet = function (url, call) {
      return service({
        url: url, // 请求url
        method: 'get', // 入参
        callback: call || '', // 回调函数
      })
    }
  }
}