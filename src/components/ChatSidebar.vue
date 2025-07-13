<template>
  <div class="chat-sidebar" :class="{ 'hidden': isHidden }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <h3>聊天记录</h3>
      <el-button 
        type="primary" 
        size="small" 
        @click="handleNewSession"
        icon="el-icon-plus"
      >
        新建会话
      </el-button>
    </div>
    
    <!-- 会话列表 -->
    <div class="session-list">
      <SessionItem 
        v-for="session in sessions"
        :key="session.id"
        :session="session"
        :is-current="currentSessionId === session.id"
        @load="handleLoadSession"
        @delete="handleDeleteSession"
        @rename="handleRenameSession"
      />
    </div>
  </div>
</template>

<script>
import SessionItem from '@/components/SessionItem'

export default {
  name: 'ChatSidebar',
  components: {
    SessionItem
  },
  props: {
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  props: {
    sessions: {
      type: Array,
      default: () => []
    },
    currentSessionId: {
      type: String,
      default: null
    }
  },
  methods: {
    handleNewSession() {
      this.$emit('new-session');
    },
    
    handleLoadSession(sessionId) {
      this.$emit('load-session', sessionId);
    },
    
    handleDeleteSession(sessionId) {
      this.$emit('delete-session', sessionId);
    },
    
    handleRenameSession(sessionId, newName) {
      this.$emit('rename-session', sessionId, newName);
    }
  }
}
</script>

<style scoped>
.chat-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 20px;
  box-sizing: border-box;
  transition: transform 0.3s ease;
  transform: translateX(0);
  z-index: 1000;
}

.chat-sidebar.hidden {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
}

.session-list {
  overflow-y: auto;
  height: calc(100vh - 80px);
}
</style> 