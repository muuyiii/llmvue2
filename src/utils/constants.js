// 模型常量
export const MODELS = {
  DEEPSEEK: 'deepseek',
  X1: 'x1'
}

// 智能体常量
export const AGENTS = {
  TRANSLATE: 'translate',
  SUMMARIZE: 'summarize'
}

// 消息角色常量
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
}

// 智能体配置
export const AGENT_CONFIG = {
  [AGENTS.TRANSLATE]: {
    type: 'translate',
    title: '中英文翻译智能体',
    description: '将中文文本翻译成英文，保持原意准确',
    icon: 'el-icon-refresh',
    systemPrompt: '您是一位专业的中英翻译员。请将用户输入的内容从中文准确翻译成英文，保持原意和语境不变。'
  },
  [AGENTS.SUMMARIZE]: {
    type: 'summarize',
    title: '文章总结智能体',
    description: '提取文章主要内容，生成简洁摘要',
    icon: 'el-icon-document',
    systemPrompt: '您是一位专业的文章摘要员。请根据用户提供的文章内容，提供一篇简洁的摘要，突出文章的主要要点和关键信息。'
  }
}

// 模型配置
export const MODEL_CONFIG = {
  [MODELS.DEEPSEEK]: {
    label: 'DeepSeek',
    value: 'deepseek',
    modelParam: 'deepseek-chat'
  },
  [MODELS.X1]: {
    label: '星火X1',
    value: 'x1',
    modelParam: 'x1'
  }
}

// API端点
export const API_ENDPOINTS = {
  CHAT: '/chat',
  MODELS: '/models',
  AGENTS: '/agents'
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请检查网络连接',
  MODEL_NOT_SUPPORTED: '不支持的模型',
  SEND_MESSAGE_FAILED: '发送消息失败',
  LOAD_SESSION_FAILED: '加载会话失败'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: '会话创建成功',
  SESSION_RENAMED: '会话重命名成功',
  SESSION_DELETED: '会话删除成功',
  MESSAGE_COPIED: '消息已复制到剪贴板'
} 