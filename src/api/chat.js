import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // TODO: 添加请求拦截逻辑
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // TODO: 添加响应拦截逻辑
    return response
  },
  error => {
    // TODO: 添加错误处理逻辑
    return Promise.reject(error)
  }
)

// 聊天API
export const chatAPI = {
  // 发送消息
  sendMessage(data) {
    // TODO: 实现发送消息接口
    return api.post('/chat', data)
  },
  
  // 获取模型列表
  getModels() {
    // TODO: 实现获取模型列表接口
    return api.get('/models')
  },
  
  // 获取智能体列表
  getAgents() {
    // TODO: 实现获取智能体列表接口
    return api.get('/agents')
  }
}

export default api 