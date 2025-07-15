<template>
  <div class="message-item" :class="{ 'user-message': isUser, 'assistant-message': !isUser }">
    <div class="message-avatar">
      <el-avatar 
        :src="avatarSrc"
        :icon="isUser ? 'el-icon-user' : 'el-icon-service'"
        size="small"
        :style="{ backgroundColor: avatarBgColor }"
      />
    </div>
    
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">{{ isUser ? '你' : authorName }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      
      <div class="message-body">
        <div class="message-text" v-html="formattedContent"></div>
        
        <!-- 消息操作按钮 -->
        <div class="message-actions">
          <el-button 
            size="mini"
            type="text"
            @click="handleCopy"
            icon="el-icon-copy-document"
            title="复制消息"
          />
          <el-button 
            v-if="!isUser"
            size="mini"
            type="text"
            @click="handleRegenerate"
            icon="el-icon-refresh"
            title="重新生成"
          />
          <el-button 
            v-if="!isUser"
            size="mini"
            type="text"
            @click="handleLike"
            :icon="isLiked ? 'el-icon-star-on' : 'el-icon-star-off'"
            :title="isLiked ? '取消收藏' : '收藏消息'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AGENT_CONFIG } from '@/utils/constants'

export default {
  name: 'MessageItem',
  props: {
    message: {
      type: Object,
      required: true
    },
    isUser: {
      type: Boolean,
      default: false
    },
    currentAgent: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isLiked: false
    }
  },
  computed: {
    // 头像图片源
    avatarSrc() {
      if (this.isUser) {
        // 用户头像：可以从用户偏好设置或默认头像获取
        const userAvatar = localStorage.getItem('userAvatar')
        return userAvatar || null
      } else {
        // AI助手头像：根据智能体类型或模型类型设置
        if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
          // 如果是智能体，使用智能体特定头像
          return this.getAgentAvatar(this.currentAgent)
        } else {
          // 普通AI助手头像
          return this.getModelAvatar(this.message.model || 'deepseek')
        }
      }
    },
    
    // 头像背景色
    avatarBgColor() {
      if (this.isUser) {
        return '#409EFF' // Element UI 主色调
      } else {
        if (this.currentAgent) {
          // 智能体专用颜色
          const colors = {
            'translate': '#67C23A', // 绿色 - 翻译
            'summarize': '#E6A23C'  // 橙色 - 总结
          }
          return colors[this.currentAgent] || '#909399'
        } else {
          // 模型专用颜色
          const colors = {
            'deepseek': '#9254de', // 紫色
            'x1': '#f56a00'        // 橙红色
          }
          return colors[this.message.model || 'deepseek'] || '#909399'
        }
      }
    },
    
    // 作者名称
    authorName() {
      if (this.isUser) {
        return '你'
      } else {
        if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
          return AGENT_CONFIG[this.currentAgent].title
        } else {
          const modelNames = {
            'deepseek': 'DeepSeek',
            'x1': '星火X1'
          }
          return modelNames[this.message.model || 'deepseek'] || 'AI助手'
        }
      }
    },
    
    // 格式化的消息内容
    formattedContent() {
      if (!this.message.content) return ''
      
      // 处理换行
      let content = this.message.content.replace(/\n/g, '<br>')
      
      // 处理代码块
      content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // 处理行内代码
      content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // 处理粗体
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // 处理斜体
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      return content
    }
  },
  methods: {
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMins < 1) {
          return '刚刚';
        } else if (diffMins < 60) {
          return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
          return `${diffHours}小时前`;
        } else {
          return date.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('时间格式化失败:', error);
        return '未知时间';
      }
    },
    
    // 复制消息
    async handleCopy() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.message.content);
          this.$message.success('消息已复制到剪贴板');
        } else {
          // 降级方案：使用传统方法
          const textArea = document.createElement('textarea');
          textArea.value = this.message.content;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.$message.success('消息已复制到剪贴板');
        }
      } catch (error) {
        console.error('复制失败:', error);
        this.$message.error('复制失败');
      }
    },
    
    // 重新生成消息
    handleRegenerate() {
      try {
        this.$emit('regenerate-message', this.message);
        this.$message.info('正在重新生成回复...');
      } catch (error) {
        console.error('重新生成失败:', error);
        this.$message.error('重新生成失败');
      }
    },
    
    // 收藏/取消收藏消息
    handleLike() {
      try {
        this.isLiked = !this.isLiked;
        this.$emit('like-message', {
          message: this.message,
          isLiked: this.isLiked
        });
        
        this.$message.success(this.isLiked ? '消息已收藏' : '已取消收藏');
      } catch (error) {
        console.error('收藏操作失败:', error);
        this.$message.error('操作失败');
      }
    },
    
    // 获取智能体头像
    getAgentAvatar(agentType) {
      // 智能体头像映射，这里可以使用实际的头像URL
      const avatars = {
        'translate': null, // 可以设置为翻译智能体的头像URL
        'summarize': null  // 可以设置为总结智能体的头像URL
      };
      return avatars[agentType] || null;
    },
    
    // 获取模型头像
    getModelAvatar(model) {
      // 模型头像映射，这里可以使用实际的头像URL
      const avatars = {
        'deepseek': null, // 可以设置为DeepSeek的logo URL
        'x1': null        // 可以设置为星火X1的logo URL
      };
      return avatars[model] || null;
    }
  },
  
  mounted() {
    // 加载消息的收藏状态
    try {
      const likedMessages = JSON.parse(localStorage.getItem('likedMessages') || '[]');
      this.isLiked = likedMessages.includes(this.message.timestamp);
    } catch (error) {
      console.error('加载收藏状态失败:', error);
    }
  }
}
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  margin-right: 12px;
  margin-left: 0;
}

.user-message .message-body {
  background-color: #409EFF;
  color: white;
}

.user-message .message-text {
  color: white;
}

.assistant-message .message-content {
  margin-left: 12px;
}

.assistant-message .message-body {
  background-color: #f5f7fa;
  color: #303133;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 60px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.message-author {
  font-weight: 500;
}

.message-time {
  font-size: 11px;
}

.message-body {
  position: relative;
  padding: 12px 16px;
  border-radius: 12px;
  word-break: break-word;
  line-height: 1.6;
}

.message-text {
  margin: 0;
}

.message-text :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin: 8px 0;
  overflow-x: auto;
}

.message-text :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.message-text :deep(strong) {
  font-weight: bold;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-actions {
  position: absolute;
  top: -8px;
  right: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-body:hover .message-actions {
  opacity: 1;
}

.user-message .message-actions {
  right: auto;
  left: 8px;
}

.message-actions .el-button {
  margin: 0 2px;
  padding: 4px;
  min-width: auto;
}

.message-actions .el-button:hover {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-item {
    margin-bottom: 16px;
  }
  
  .message-content {
    max-width: calc(100% - 48px);
  }
  
  .message-body {
    padding: 10px 12px;
  }
  
  .message-actions {
    position: static;
    margin-top: 8px;
    opacity: 1;
    box-shadow: none;
    background: transparent;
  }
}
</style> 