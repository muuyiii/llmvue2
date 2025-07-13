<template>
  <div class="chat-input">
    <div class="input-container">
      <el-input 
        v-model="message"
        type="textarea"
        :rows="3"
        placeholder="输入你的消息..."
        :disabled="isLoading"
        @keydown.enter.exact.prevent="handleSendMessage"
        @keydown.enter.shift.exact="handleNewLine"
        resize="none"
      />
      
      <div class="input-actions">
        <el-button 
          type="primary"
          @click="handleSendMessage"
          :disabled="!message.trim() || isLoading"
          :loading="isLoading"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      message: ''
    }
  },
  methods: {
    handleSendMessage() {
      if (!this.message.trim()) return;
      
      // 向父组件发送消息
      this.$emit('send-message', this.message.trim());
      
      // 清空输入框
      this.message = '';
    },
    
    handleNewLine() {
      // Shift+Enter时换行
      this.message += '\n';
    },
    
    clearMessage() {
      this.message = '';
    }
  }
}
</script>

<style scoped>
.chat-input {
  background: white;
  border-top: 1px solid #e6e6e6;
  padding: 15px 20px;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-container :deep(.el-textarea) {
  flex: 1;
}

.input-actions {
  display: flex;
  align-items: center;
}
</style> 