<template>
  <div class="chat-input">
    <div class="input-container">
      <!-- 主输入区域 -->
      <div class="input-main">
        <el-input 
          ref="messageInput"
          v-model="message"
          type="textarea"
          :rows="inputRows"
          :placeholder="inputPlaceholder"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="handleSendMessage"
          @keydown.enter.shift.exact="handleNewLine"
          @keydown.up.prevent="handleHistoryUp"
          @keydown.down.prevent="handleHistoryDown"
          @input="handleInput"
          resize="none"
          class="message-textarea"
        />
        
        <!-- 输入提示 -->
        <div v-if="showSuggestions && suggestions.length > 0" class="input-suggestions">
          <div 
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
            :class="{ 'active': selectedSuggestionIndex === index }"
            @click="applySuggestion(suggestion)"
          >
            <i :class="suggestion.icon"></i>
            <span>{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
      
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <!-- 左侧工具 -->
        <div class="toolbar-left">
          <!-- 文件上传 -->
          <el-upload
            ref="fileUpload"
            :show-file-list="false"
            :before-upload="handleFileUpload"
            :accept="acceptedFileTypes"
            multiple
          >
            <el-button 
              size="mini" 
              type="text" 
              icon="el-icon-paperclip"
              title="上传文件"
              :disabled="isLoading"
            />
          </el-upload>
          
          <!-- 表情符号 -->
          <el-popover
            placement="top"
            width="300"
            trigger="click"
            v-model="showEmojiPicker"
          >
            <div class="emoji-picker">
              <div 
                v-for="emoji in commonEmojis"
                :key="emoji"
                class="emoji-item"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </div>
            </div>
            <el-button 
              slot="reference"
              size="mini" 
              type="text" 
              icon="el-icon-smile"
              title="表情符号"
              :disabled="isLoading"
            />
          </el-popover>
          
          <!-- 清空输入 -->
          <el-button 
            size="mini" 
            type="text" 
            icon="el-icon-delete"
            title="清空输入"
            :disabled="isLoading || !message.trim()"
            @click="clearInput"
          />
        </div>
        
        <!-- 右侧操作 -->
        <div class="toolbar-right">
          <!-- 字数统计 -->
          <span class="char-count" :class="{ 'warning': message.length > maxLength * 0.8 }">
            {{ message.length }}/{{ maxLength }}
          </span>
          
          <!-- 发送按钮 -->
          <el-button 
            type="primary"
            size="small"
            @click="handleSendMessage"
            :disabled="!canSend"
            :loading="isLoading"
            icon="el-icon-s-promotion"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 输入提示信息 -->
    <div v-if="showInputHint" class="input-hint">
      <el-alert
        :title="inputHintText"
        type="info"
        size="mini"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
import { AGENT_CONFIG } from '@/utils/constants'

export default {
  name: 'ChatInput',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    currentAgent: {
      type: String,
      default: null
    },
    maxLength: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      message: '',
      messageHistory: [],
      historyIndex: -1,
      showEmojiPicker: false,
      showSuggestions: false,
      selectedSuggestionIndex: 0,
      acceptedFileTypes: '.txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
      commonEmojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '🔥', '💯', '✨', '🎉', '🎊', '💕', '💖', '💗', '💓', '💝'
      ]
    }
  },
  computed: {
    inputRows() {
      const lines = this.message.split('\n').length
      return Math.min(Math.max(lines, 1), 6)
    },
    
    inputPlaceholder() {
      if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
        const agentName = AGENT_CONFIG[this.currentAgent].title
        return `向${agentName}发送消息... (Enter发送，Shift+Enter换行)`
      }
      return '输入你的消息... (Enter发送，Shift+Enter换行)'
    },
    
    canSend() {
      return this.message.trim().length > 0 && 
             this.message.length <= this.maxLength && 
             !this.isLoading
    },
    
    suggestions() {
      if (!this.message.trim() || this.message.length < 2) return []
      
      const commonSuggestions = [
        { text: '请帮我分析一下', icon: 'el-icon-search' },
        { text: '请详细解释', icon: 'el-icon-document' },
        { text: '有什么建议吗？', icon: 'el-icon-question' },
        { text: '总结一下要点', icon: 'el-icon-tickets' }
      ]
      
      // 根据智能体类型提供专业建议
      if (this.currentAgent === 'translate') {
        return [
          { text: '请翻译为英文', icon: 'el-icon-refresh' },
          { text: '请翻译这段文字', icon: 'el-icon-refresh' },
          { text: '翻译并解释含义', icon: 'el-icon-refresh' }
        ]
      } else if (this.currentAgent === 'summarize') {
        return [
          { text: '请总结这篇文章', icon: 'el-icon-document' },
          { text: '提取关键要点', icon: 'el-icon-tickets' },
          { text: '概括主要内容', icon: 'el-icon-document' }
        ]
      }
      
      return commonSuggestions.filter(s => 
        s.text.toLowerCase().includes(this.message.toLowerCase())
      )
    },
    
    showInputHint() {
      return this.currentAgent && AGENT_CONFIG[this.currentAgent]
    },
    
    inputHintText() {
      if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
        return `当前智能体：${AGENT_CONFIG[this.currentAgent].description}`
      }
      return ''
    }
  },
  methods: {
    handleSendMessage() {
      if (!this.canSend) return
      
      const messageToSend = this.message.trim()
      
      // 保存到历史记录
      this.saveToHistory(messageToSend)
      
      // 向父组件发送消息
      this.$emit('send-message', messageToSend)
      
      // 清空输入框
      this.clearInput()
      
      // 隐藏建议
      this.showSuggestions = false
    },
    
    handleNewLine() {
      // Shift+Enter时换行
      this.message += '\n'
    },
    
    handleInput() {
      // 显示智能建议
      this.showSuggestions = this.message.trim().length > 0
      this.selectedSuggestionIndex = 0
    },
    
    handleHistoryUp() {
      if (this.messageHistory.length === 0) return
      
      if (this.historyIndex < this.messageHistory.length - 1) {
        this.historyIndex++
        this.message = this.messageHistory[this.messageHistory.length - 1 - this.historyIndex]
      }
    },
    
    handleHistoryDown() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.message = this.messageHistory[this.messageHistory.length - 1 - this.historyIndex]
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1
        this.message = ''
      }
    },
    
    saveToHistory(message) {
      // 避免重复保存相同消息
      if (this.messageHistory[this.messageHistory.length - 1] !== message) {
        this.messageHistory.push(message)
        
        // 限制历史记录数量
        if (this.messageHistory.length > 50) {
          this.messageHistory = this.messageHistory.slice(-50)
        }
        
        // 保存到本地存储
        try {
          localStorage.setItem('messageHistory', JSON.stringify(this.messageHistory))
        } catch (error) {
          console.warn('保存消息历史失败:', error)
        }
      }
      
      this.historyIndex = -1
    },
    
    loadHistory() {
      try {
        const stored = localStorage.getItem('messageHistory')
        if (stored) {
          this.messageHistory = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('加载消息历史失败:', error)
      }
    },
    
    clearInput() {
      this.message = ''
      this.historyIndex = -1
      this.showSuggestions = false
    },
    
    insertEmoji(emoji) {
      const textarea = this.$refs.messageInput.$el.querySelector('textarea')
      const cursorPos = textarea.selectionStart
      const textBefore = this.message.substring(0, cursorPos)
      const textAfter = this.message.substring(cursorPos)
      
      this.message = textBefore + emoji + textAfter
      
      // 设置光标位置
      this.$nextTick(() => {
        textarea.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length)
        textarea.focus()
      })
      
      this.showEmojiPicker = false
    },
    
    applySuggestion(suggestion) {
      this.message = suggestion.text
      this.showSuggestions = false
      
      // 聚焦输入框
      this.$nextTick(() => {
        this.$refs.messageInput.focus()
      })
    },
    
    async handleFileUpload(file) {
      try {
        // 检查文件大小 (限制为10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
          this.$message.error('文件大小不能超过10MB')
          return false
        }
        
        // 检查文件类型
        const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 
                             'image/jpeg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          this.$message.error('不支持的文件类型')
          return false
        }
        
        // 读取文件内容
        if (file.type.startsWith('text/')) {
          const text = await this.readFileAsText(file)
          this.message += `\n\n[文件: ${file.name}]\n${text}\n`
        } else if (file.type.startsWith('image/')) {
          this.$message.info('图片上传功能开发中...')
        } else {
          this.$message.info('文档解析功能开发中...')
        }
        
        this.$message.success(`文件 ${file.name} 已添加到输入框`)
        return false // 阻止自动上传
        
      } catch (error) {
        console.error('文件处理失败:', error)
        this.$message.error('文件处理失败')
        return false
      }
    },
    
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file, 'UTF-8')
      })
    },
    
    focusInput() {
      this.$nextTick(() => {
        this.$refs.messageInput.focus()
      })
    }
  },
  
  mounted() {
    // 加载消息历史
    this.loadHistory()
    
    // 自动聚焦
    this.focusInput()
  }
}
</script>

<style scoped>
.chat-input {
  background: white;
  border-top: 1px solid #e6e6e6;
  padding: 16px 20px 12px;
}

.input-container {
  position: relative;
}

.input-main {
  position: relative;
  margin-bottom: 12px;
}

.message-textarea {
  width: 100%;
}

.message-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid #e6e6e6;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s ease;
}

.message-textarea :deep(.el-textarea__inner):focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-suggestions {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-bottom: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f5f7fa;
}

.suggestion-item i {
  color: #409EFF;
  font-size: 14px;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.char-count {
  font-size: 12px;
  color: #909399;
  transition: color 0.2s;
}

.char-count.warning {
  color: #E6A23C;
}

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  padding: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

.input-hint {
  margin-top: 8px;
}

.input-hint :deep(.el-alert) {
  padding: 8px 12px;
}

.input-hint :deep(.el-alert__title) {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-input {
    padding: 12px 16px 8px;
  }
  
  .input-toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .emoji-picker {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style> 