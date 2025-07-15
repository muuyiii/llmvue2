import axios from 'axios'
import { MODELS, AGENTS, API_ENDPOINTS } from '@/utils/constants'

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
    // 添加请求ID用于调试
    config.requestId = Date.now().toString()
    
    // 打印请求信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request ${config.requestId}]`, {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data
      })
    }
    
    // 添加认证头（如果需要）
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 打印响应信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response ${response.config.requestId}]`, {
        status: response.status,
        data: response.data
      })
    }
    
    // 统一处理响应数据
    if (response.data && typeof response.data === 'object') {
      return response.data
    }
    
    return response
  },
  error => {
    // 统一错误处理
    console.error('[API Response Error]', error)
    
    let errorMessage = '网络错误，请稍后重试'
    let errorCode = 'NETWORK_ERROR'
    
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          errorCode = 'BAD_REQUEST'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          errorCode = 'UNAUTHORIZED'
          break
        case 403:
          errorMessage = '权限不足'
          errorCode = 'FORBIDDEN'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          errorCode = 'NOT_FOUND'
          break
        case 429:
          errorMessage = '请求过于频繁，请稍后再试'
          errorCode = 'TOO_MANY_REQUESTS'
          break
        case 500:
          errorMessage = '服务器内部错误'
          errorCode = 'SERVER_ERROR'
          break
        default:
          errorMessage = data?.message || `服务器错误 (${status})`
          errorCode = 'SERVER_ERROR'
      }
    } else if (error.request) {
      // 网络错误
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接'
        errorCode = 'TIMEOUT'
      } else {
        errorMessage = '无法连接到服务器，请检查网络'
        errorCode = 'NETWORK_ERROR'
      }
    }
    
    // 创建标准化错误对象
    const standardError = new Error(errorMessage)
    standardError.code = errorCode
    standardError.originalError = error
    
    return Promise.reject(standardError)
  }
)

// 聊天API
export const chatAPI = {
  // 发送消息
  async sendMessage(data) {
    try {
      // 验证必要参数
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error('消息列表不能为空')
      }
      
      if (!data.model || !Object.values(MODELS).includes(data.model)) {
        throw new Error('无效的模型参数')
      }
      
      // 构建请求数据
      const requestData = {
        model: data.model,
        messages: data.messages,
        agent_type: data.agent_type || null,
        temperature: data.temperature || 0.7,
        max_tokens: data.max_tokens || 2000,
        stream: data.stream || false
      }
      
      // 发送请求
      const response = await api.post(API_ENDPOINTS.CHAT, requestData)
      
      // 验证响应格式
      if (!response.content) {
        throw new Error('服务器响应格式错误')
      }
      
      return {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        model: data.model,
        agent_type: data.agent_type
      }
      
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  },
  
  // 获取模型列表
  async getModels() {
    try {
      const response = await api.get(API_ENDPOINTS.MODELS)
      
      // 如果后端没有实现，返回默认模型列表
      if (!response || response.length === 0) {
        return Object.values(MODELS).map(model => ({
          id: model,
          name: model === MODELS.DEEPSEEK ? 'DeepSeek' : '星火X1',
          available: true
        }))
      }
      
      return response
    } catch (error) {
      console.warn('获取模型列表失败，使用默认列表:', error)
      
      // 返回默认模型列表
      return Object.values(MODELS).map(model => ({
        id: model,
        name: model === MODELS.DEEPSEEK ? 'DeepSeek' : '星火X1',
        available: true
      }))
    }
  },
  
  // 获取智能体列表
  async getAgents() {
    try {
      const response = await api.get(API_ENDPOINTS.AGENTS)
      
      // 如果后端没有实现，返回默认智能体列表
      if (!response || response.length === 0) {
        return Object.values(AGENTS).map(agent => ({
          id: agent,
          name: agent === AGENTS.TRANSLATE ? '中英文翻译智能体' : '文章总结智能体',
          description: agent === AGENTS.TRANSLATE ? 
            '将中文文本翻译成英文，保持原意准确' : 
            '提取文章主要内容，生成简洁摘要',
          available: true
        }))
      }
      
      return response
    } catch (error) {
      console.warn('获取智能体列表失败，使用默认列表:', error)
      
      // 返回默认智能体列表
      return Object.values(AGENTS).map(agent => ({
        id: agent,
        name: agent === AGENTS.TRANSLATE ? '中英文翻译智能体' : '文章总结智能体',
        description: agent === AGENTS.TRANSLATE ? 
          '将中文文本翻译成英文，保持原意准确' : 
          '提取文章主要内容，生成简洁摘要',
        available: true
      }))
    }
  },

  // 流式发送消息（用于实时响应）
  async sendMessageStream(data, onMessage, onComplete, onError) {
    try {
      const requestData = {
        ...data,
        stream: true
      }
      
      const response = await fetch(`${api.defaults.baseURL}${API_ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...api.defaults.headers
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let content = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete && onComplete({
            role: 'assistant',
            content,
            timestamp: new Date().toISOString(),
            model: data.model,
            agent_type: data.agent_type
          })
          break
        }
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                content += data.content
                onMessage && onMessage(data.content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
    } catch (error) {
      console.error('流式消息发送失败:', error)
      onError && onError(error)
    }
  },

  // 健康检查
  async healthCheck() {
    try {
      const response = await api.get('/health')
      return response.status === 'ok'
    } catch (error) {
      return false
    }
  }
}

// 导出默认axios实例
export default api 