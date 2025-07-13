<template>
  <div class="chat-interface">
    <!-- 侧边栏 -->
    <ChatSidebar 
      :is-hidden="sidebarHidden"
      :sessions="sessions"
      :current-session-id="currentSessionId"
      @new-session="handleNewSession"
      @load-session="handleLoadSession"
      @delete-session="handleDeleteSession"
      @rename-session="handleRenameSession"
    />
    
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'sidebar-hidden': sidebarHidden }">
      <!-- 顶部工具栏 -->
      <ChatToolbar 
        @toggle-sidebar="toggleSidebar"
        @open-agent-selection="handleOpenAgentSelection"
        @model-change="handleModelChange"
        :current-model="currentModel"
        :current-agent="currentAgent"
      />
      
      <!-- 聊天容器 -->
      <ChatContainer 
        :messages="currentMessages"
        :is-loading="isLoading"
      />
      
      <!-- 输入区域 -->
      <ChatInput 
        @send-message="handleSendMessage"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>

<script>
import ChatSidebar from '@/components/ChatSidebar'
import ChatToolbar from '@/components/ChatToolbar'
import ChatContainer from '@/components/ChatContainer'
import ChatInput from '@/components/ChatInput'

export default {
  name: 'ChatInterface',
  components: {
    ChatSidebar,
    ChatToolbar,
    ChatContainer,
    ChatInput
  },
  data() {
    return {
      sidebarHidden: false,
      currentModel: 'deepseek',
      currentAgent: null,
      currentMessages: [],
      isLoading: false,
      sessions: [],
      currentSessionId: null
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarHidden = !this.sidebarHidden;
    },
    
    handleNewSession() {
      // 创建新会话
      const newSession = {
        id: Date.now().toString(),
        name: `新会话${Date.now().toString().slice(-4)}`,
        messages: [],
        created: new Date().toISOString(),
        agentType: null
      };
      
      this.sessions.unshift(newSession);
      this.currentSessionId = newSession.id;
      this.currentMessages = [];
      this.currentAgent = null;
      
      // 保存到本地存储
      this.saveSessions();
    },
    
    handleLoadSession(sessionId) {
      const session = this.sessions.find(s => s.id === sessionId);
      if (session) {
        this.currentSessionId = sessionId;
        this.currentMessages = session.messages || [];
        this.currentAgent = session.agentType;
      }
    },
    
    handleDeleteSession(sessionId) {
      const index = this.sessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        this.sessions.splice(index, 1);
        
        // 如果删除的是当前会话，切换到第一个会话
        if (this.currentSessionId === sessionId) {
          if (this.sessions.length > 0) {
            this.handleLoadSession(this.sessions[0].id);
          } else {
            this.handleNewSession();
          }
        }
        
        this.saveSessions();
      }
    },
    
    handleRenameSession(sessionId, newName) {
      const session = this.sessions.find(s => s.id === sessionId);
      if (session) {
        session.name = newName;
        this.saveSessions();
      }
    },
    
    handleOpenAgentSelection() {
      this.$router.push('/agent-selection');
    },
    
    handleModelChange(model) {
      this.currentModel = model;
      console.log('切换模型:', model);
    },
    
    async handleSendMessage(message) {
      if (!message.trim()) return;
      
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      this.currentMessages.push(userMessage);
      this.isLoading = true;
      
      try {
        // 模拟API调用（暂时）
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 添加AI回复
        const aiMessage = {
          role: 'assistant',
          content: `收到您的消息: "${message}"\n\n这是一个模拟回复，实际功能需要连接后端API。\n当前模型: ${this.currentModel}\n当前智能体: ${this.currentAgent || '无'}`,
          timestamp: new Date().toISOString()
        };
        
        this.currentMessages.push(aiMessage);
        
        // 保存到当前会话
        this.saveCurrentSession();
        
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败，请重试');
      } finally {
        this.isLoading = false;
      }
    },
    
    // 保存会话到本地存储
    saveSessions() {
      localStorage.setItem('chatSessions', JSON.stringify(this.sessions));
    },
    
    // 保存当前会话消息
    saveCurrentSession() {
      const session = this.sessions.find(s => s.id === this.currentSessionId);
      if (session) {
        session.messages = this.currentMessages;
        this.saveSessions();
      }
    },
    
    // 从本地存储加载会话
    loadSessions() {
      const stored = localStorage.getItem('chatSessions');
      if (stored) {
        this.sessions = JSON.parse(stored);
      }
      
      // 如果没有会话，创建一个默认会话
      if (this.sessions.length === 0) {
        this.handleNewSession();
      } else {
        // 加载第一个会话
        this.handleLoadSession(this.sessions[0].id);
      }
    },
    
    // 处理智能体查询参数
    handleAgentQuery() {
      const agent = this.$route.query.agent;
      if (agent) {
        // 创建新的智能体会话
        this.createAgentSession(agent);
        
        // 清除查询参数
        this.$router.replace({ path: '/' });
      }
    },
    
    // 创建智能体会话
    createAgentSession(agentType) {
      const agentNames = {
        'translate': '中译英助手',
        'summarize': '文章总结助手'
      };
      
      const newSession = {
        id: Date.now().toString(),
        name: agentNames[agentType] || `智能体会话${Date.now().toString().slice(-4)}`,
        messages: [],
        created: new Date().toISOString(),
        agentType: agentType
      };
      
      this.sessions.unshift(newSession);
      this.currentSessionId = newSession.id;
      this.currentMessages = [];
      this.currentAgent = agentType;
      
      // 保存到本地存储
      this.saveSessions();
      
      // 显示提示
      this.$message.success(`已创建 ${agentNames[agentType]} 会话`);
    }
  },
  
  mounted() {
    // 加载会话数据
    this.loadSessions();
    
    // 处理智能体选择
    this.handleAgentQuery();
  },
  
  watch: {
    '$route'(to, from) {
      // 监听路由变化，处理智能体选择
      this.handleAgentQuery();
    }
  }
}
</script>

<style scoped>
.chat-interface {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding-left: 280px;
  display: flex;
  flex-direction: column;
  transition: padding-left 0.3s ease;
}

.main-content.sidebar-hidden {
  padding-left: 0;
}
</style> 