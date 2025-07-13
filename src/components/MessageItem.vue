<template>
  <div class="message-item" :class="{ 'user-message': isUser, 'assistant-message': !isUser }">
    <div class="message-avatar">
      <el-avatar 
        :src="avatarSrc"
        :icon="isUser ? 'el-icon-user' : 'el-icon-service'"
        size="small"
      />
    </div>
    
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">{{ isUser ? '你' : '智能体' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      
      <div class="message-body">
        <div class="message-text">{{ message.content }}</div>
        
        <!-- 消息操作按钮 -->
        <div class="message-actions">
          <el-button 
            size="mini"
            type="text"
            @click="handleCopy"
            icon="el-icon-copy-document"
          />
          <el-button 
            v-if="!isUser"
            size="mini"
            type="text"
            @click="handleRegenerate"
            icon="el-icon-refresh"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    }
  },
  computed: {
    avatarSrc() {
      // TODO: 实现头像逻辑
      return null
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    handleCopy() {
      navigator.clipboard.writeText(this.message.content).then(() => {
        this.$message.success('消息已复制到剪贴板');
      }).catch(() => {
        this.$message.error('复制失败');
      });
    },
    
    handleRegenerate() {
      this.$emit('regenerate', this.message);
    }
  }
}
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: #007bff;
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.assistant-message .message-content {
  background: white;
  color: #333;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #e6e6e6;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  position: relative;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  opacity: 0.7;
}

.message-body {
  position: relative;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.message-actions {
  display: none;
  position: absolute;
  top: -10px;
  right: -10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
  padding: 2px;
}

.message-item:hover .message-actions {
  display: flex;
}
</style> 