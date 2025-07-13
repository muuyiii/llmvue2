<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <MessageItem 
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        :is-user="message.role === 'user'"
      />
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <el-icon class="is-loading">
          <i class="el-icon-loading"></i>
        </el-icon>
        <span>智能体正在思考...</span>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="messages.length === 0" class="empty-state">
      <el-empty 
        description="开始你的第一次对话吧！"
        :image-size="100"
      />
    </div>
  </div>
</template>

<script>
import MessageItem from '@/components/MessageItem'

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
    }
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const messageList = this.$refs.messageList;
        if (messageList) {
          messageList.scrollTop = messageList.scrollHeight;
        }
      });
    },
    
    handleScroll() {
      // 处理滚动事件（如果需要）
    }
  },
  
  updated() {
    // 当消息更新时自动滚动到底部
    this.scrollToBottom();
  },
  
  mounted() {
    this.scrollToBottom();
  }
}
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  color: #666;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 