// 本地存储工具类
export class LocalStorage {
  // 获取聊天会话
  static getSessions() {
    try {
      const sessions = localStorage.getItem('chatSessions')
      return sessions ? JSON.parse(sessions) : []
    } catch (error) {
      console.error('获取会话数据失败:', error)
      return []
    }
  }
  
  // 保存聊天会话
  static saveSessions(sessions) {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(sessions))
      return true
    } catch (error) {
      console.error('保存会话数据失败:', error)
      return false
    }
  }
  
  // 获取当前会话ID
  static getCurrentSessionId() {
    try {
      return localStorage.getItem('currentSessionId')
    } catch (error) {
      console.error('获取当前会话ID失败:', error)
      return null
    }
  }
  
  // 保存当前会话ID
  static saveCurrentSessionId(sessionId) {
    try {
      if (sessionId) {
        localStorage.setItem('currentSessionId', sessionId)
      } else {
        localStorage.removeItem('currentSessionId')
      }
      return true
    } catch (error) {
      console.error('保存当前会话ID失败:', error)
      return false
    }
  }
  
  // 获取用户偏好设置
  static getPreferences() {
    try {
      const preferences = localStorage.getItem('userPreferences')
      return preferences ? JSON.parse(preferences) : {
        model: 'deepseek',
        theme: 'light',
        sidebarHidden: false,
        autoSave: true,
        messageSound: true
      }
    } catch (error) {
      console.error('获取用户偏好设置失败:', error)
      return {
        model: 'deepseek',
        theme: 'light',
        sidebarHidden: false,
        autoSave: true,
        messageSound: true
      }
    }
  }
  
  // 保存用户偏好设置
  static savePreferences(preferences) {
    try {
      const currentPreferences = this.getPreferences()
      const updatedPreferences = { ...currentPreferences, ...preferences }
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
      return true
    } catch (error) {
      console.error('保存用户偏好设置失败:', error)
      return false
    }
  }
  
  // 清除所有数据
  static clearAll() {
    try {
      localStorage.removeItem('chatSessions')
      localStorage.removeItem('currentSessionId')
      localStorage.removeItem('userPreferences')
      return true
    } catch (error) {
      console.error('清除数据失败:', error)
      return false
    }
  }

  // 导出数据
  static exportData() {
    try {
      const data = {
        sessions: this.getSessions(),
        currentSessionId: this.getCurrentSessionId(),
        preferences: this.getPreferences(),
        exportTime: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('导出数据失败:', error)
      return null
    }
  }

  // 导入数据
  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData)
      if (data.sessions) this.saveSessions(data.sessions)
      if (data.currentSessionId) this.saveCurrentSessionId(data.currentSessionId)
      if (data.preferences) this.savePreferences(data.preferences)
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }
}

// 会话管理工具
export class SessionManager {
  // 创建新会话
  static createSession(name = null, agentType = null) {
    const sessionId = Date.now().toString()
    const session = {
      id: sessionId,
      name: name || this.generateSessionName(agentType),
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages: [],
      agentType: agentType || null,
      model: 'deepseek',
      messageCount: 0
    }
    return session
  }
  
  // 生成会话名称
  static generateSessionName(agentType) {
    const timestamp = Date.now().toString().slice(-4)
    const agentNames = {
      'translate': '中译英助手',
      'summarize': '文章总结助手'
    }
    
    if (agentType && agentNames[agentType]) {
      return `${agentNames[agentType]} ${timestamp}`
    }
    
    return `新会话 ${timestamp}`
  }
  
  // 格式化时间
  static formatTime(timestamp) {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) {
        return '刚刚'
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`
      } else if (diffHours < 24) {
        return `${diffHours}小时前`
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleString('zh-CN', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch (error) {
      console.error('时间格式化失败:', error)
      return '未知时间'
    }
  }

  // 更新会话
  static updateSession(sessions, sessionId, updates) {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      }
      return true
    }
    return false
  }

  // 删除会话
  static deleteSession(sessions, sessionId) {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      sessions.splice(sessionIndex, 1)
      return true
    }
    return false
  }

  // 获取会话统计信息
  static getSessionStats(session) {
    if (!session || !session.messages) {
      return { messageCount: 0, userMessages: 0, assistantMessages: 0 }
    }

    const userMessages = session.messages.filter(m => m.role === 'user').length
    const assistantMessages = session.messages.filter(m => m.role === 'assistant').length

    return {
      messageCount: session.messages.length,
      userMessages,
      assistantMessages
    }
  }
} 