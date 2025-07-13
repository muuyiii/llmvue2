// 本地存储工具类
export class LocalStorage {
  // 获取聊天会话
  static getSessions() {
    // TODO: 实现获取会话逻辑
    const sessions = localStorage.getItem('chatSessions')
    return sessions ? JSON.parse(sessions) : []
  }
  
  // 保存聊天会话
  static saveSessions(sessions) {
    // TODO: 实现保存会话逻辑
    localStorage.setItem('chatSessions', JSON.stringify(sessions))
  }
  
  // 获取当前会话ID
  static getCurrentSessionId() {
    // TODO: 实现获取当前会话ID逻辑
    return localStorage.getItem('currentSessionId')
  }
  
  // 保存当前会话ID
  static saveCurrentSessionId(sessionId) {
    // TODO: 实现保存当前会话ID逻辑
    localStorage.setItem('currentSessionId', sessionId)
  }
  
  // 获取用户偏好设置
  static getPreferences() {
    // TODO: 实现获取用户偏好设置逻辑
    const preferences = localStorage.getItem('userPreferences')
    return preferences ? JSON.parse(preferences) : {
      model: 'deepseek',
      theme: 'light',
      sidebarHidden: false
    }
  }
  
  // 保存用户偏好设置
  static savePreferences(preferences) {
    // TODO: 实现保存用户偏好设置逻辑
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  }
  
  // 清除所有数据
  static clearAll() {
    // TODO: 实现清除所有数据逻辑
    localStorage.removeItem('chatSessions')
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('userPreferences')
  }
}

// 会话管理工具
export class SessionManager {
  // 创建新会话
  static createSession(name = null, agentType = null) {
    // TODO: 实现创建新会话逻辑
    const sessionId = Date.now().toString()
    return {
      id: sessionId,
      name: name || `会话${sessionId.slice(-4)}`,
      created: new Date().toISOString(),
      messages: [],
      agentType: agentType || null
    }
  }
  
  // 生成会话名称
  static generateSessionName(agentType) {
    // TODO: 实现生成会话名称逻辑
    const agentNames = {
      'translate': '中译英助手',
      'summarize': '文章总结助手'
    }
    return agentNames[agentType] || `新会话${Date.now().toString().slice(-4)}`
  }
  
  // 格式化时间
  static formatTime(timestamp) {
    // TODO: 实现时间格式化逻辑
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
} 