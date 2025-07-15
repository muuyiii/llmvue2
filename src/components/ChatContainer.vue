<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <MessageItem 
        v-for="(message, index) in messages"
        :key="`${message.timestamp}-${index}`"
        :message="message"
        :is-user="message.role === 'user'"
        :current-agent="currentAgent"
        @regenerate-message="handleRegenerateMessage"
        @like-message="handleLikeMessage"
      />
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <el-icon class="is-loading">
          <i class="el-icon-loading"></i>
        </el-icon>
        <span>{{ loadingText }}</span>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="messages.length === 0 && !isLoading" class="empty-state">
      <el-empty 
        :description="emptyDescription"
        :image-size="100"
      >
        <template #image>
          <el-icon size="64" color="#c0c4cc">
            <i class="el-icon-chat-line-round"></i>
          </el-icon>
        </template>
        <el-button type="primary" @click="handleStartChat">开始对话</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import MessageItem from '@/components/MessageItem'
import { AGENT_CONFIG } from '@/utils/constants'

export default {
  name: 'ChatContainer',
  components: {
    MessageItem
  },
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    currentAgent: {
      type: String,
      default: null
    }
  },
  computed: {
    // 加载文本
    loadingText() {
      if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
        return `${AGENT_CONFIG[this.currentAgent].title}正在思考...`
      }
      return '智能体正在思考...'
    },
    
    // 空状态描述
    emptyDescription() {
      if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
        return `与${AGENT_CONFIG[this.currentAgent].title}开始对话吧！`
      }
      return '开始你的第一次对话吧！'
    }
  },
  methods: {
    // 滚动到底部
    scrollToBottom() {
      try {
        this.$nextTick(() => {
          const messageList = this.$refs.messageList
          if (messageList) {
            messageList.scrollTop = messageList.scrollHeight
          }
        })
      } catch (error) {
        console.error('滚动失败:', error)
      }
    },
    
    // 处理重新生成消息
    handleRegenerateMessage(message) {
      try {
        this.$emit('regenerate-message', message)
      } catch (error) {
        console.error('重新生成消息失败:', error)
      }
    },
    
    // 处理收藏消息
    handleLikeMessage(data) {
      try {
        // 保存到本地存储
        const likedMessages = JSON.parse(localStorage.getItem('likedMessages') || '[]')
        const messageId = data.message.timestamp
        
        if (data.isLiked) {
          // 添加收藏
          if (!likedMessages.includes(messageId)) {
            likedMessages.push(messageId)
          }
        } else {
          // 取消收藏
          const index = likedMessages.indexOf(messageId)
          if (index > -1) {
            likedMessages.splice(index, 1)
          }
        }
        
        localStorage.setItem('likedMessages', JSON.stringify(likedMessages))
        this.$emit('like-message', data)
      } catch (error) {
        console.error('处理收藏消息失败:', error)
      }
    },
    
    // 处理开始对话按钮
    handleStartChat() {
      try {
        this.$emit('start-chat')
      } catch (error) {
        console.error('开始对话失败:', error)
      }
    },
    
    // 平滑滚动到底部
    smoothScrollToBottom() {
      try {
        this.$nextTick(() => {
          const messageList = this.$refs.messageList
          if (messageList) {
            messageList.scrollTo({
              top: messageList.scrollHeight,
              behavior: 'smooth'
            })
          }
        })
      } catch (error) {
        console.error('平滑滚动失败:', error)
      }
    }
  },
  
  watch: {
    // 监听消息变化，自动滚动到底部
    messages: {
      handler() {
        this.scrollToBottom()
      },
      deep: true
    },
    
    // 监听加载状态，开始加载时滚动到底部
    isLoading(newVal) {
      if (newVal) {
        this.scrollToBottom()
      }
    }
  },
  
  mounted() {
    // 初始化时滚动到底部
    this.scrollToBottom()
  }
}
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #fafafa;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.loading-indicator .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-state .el-empty {
  flex: 1;
}

/* 加载动画 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.is-loading {
  animation: rotate 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-list {
    padding: 16px 12px;
  }
  
  .empty-state {
    padding: 20px 16px;
  }
  
  .loading-indicator {
    padding: 16px;
    font-size: 13px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background-color: #1e1e1e;
  }
  
  .loading-indicator {
    color: #a8abb2;
  }
}
</style> 