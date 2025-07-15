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
        :current-agent="currentAgent"
        @regenerate-message="handleRegenerateMessage"
        @like-message="handleLikeMessage"
        @start-chat="handleStartChat"
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
import { chatAPI } from '@/api/chat'
import { LocalStorage, SessionManager } from '@/utils/storage'
import { AGENT_CONFIG, MESSAGE_ROLES } from '@/utils/constants'

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
      currentSessionId: null,
      preferences: {}
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarHidden = !this.sidebarHidden;
      
      // 保存用户偏好
      this.savePreferences({ sidebarHidden: this.sidebarHidden });
    },
    
    handleNewSession() {
      try {
        // 创建新会话
        const newSession = SessionManager.createSession();
        
        this.sessions.unshift(newSession);
        this.currentSessionId = newSession.id;
        this.currentMessages = [];
        this.currentAgent = null;
        
        // 保存到本地存储
        this.saveSessions();
        LocalStorage.saveCurrentSessionId(newSession.id);
        
        this.$message.success('新会话创建成功');
      } catch (error) {
        console.error('创建新会话失败:', error);
        this.$message.error('创建新会话失败');
      }
    },
    
    handleLoadSession(sessionId) {
      try {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
          this.currentSessionId = sessionId;
          this.currentMessages = session.messages || [];
          this.currentAgent = session.agentType;
          this.currentModel = session.model || this.currentModel;
          
          // 保存当前会话ID
          LocalStorage.saveCurrentSessionId(sessionId);
        }
      } catch (error) {
        console.error('加载会话失败:', error);
        this.$message.error('加载会话失败');
      }
    },
    
    handleDeleteSession(sessionId) {
      try {
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
          this.$message.success('会话删除成功');
        }
      } catch (error) {
        console.error('删除会话失败:', error);
        this.$message.error('删除会话失败');
      }
    },
    
    handleRenameSession(sessionId, newName) {
      try {
        const success = SessionManager.updateSession(this.sessions, sessionId, { name: newName });
        if (success) {
          this.saveSessions();
          this.$message.success('会话重命名成功');
        }
      } catch (error) {
        console.error('重命名会话失败:', error);
        this.$message.error('重命名会话失败');
      }
    },
    
    handleOpenAgentSelection() {
      this.$router.push('/agent-selection');
    },
    
    handleModelChange(model) {
      try {
        this.currentModel = model;
        
        // 更新当前会话的模型设置
        if (this.currentSessionId) {
          SessionManager.updateSession(this.sessions, this.currentSessionId, { model });
          this.saveSessions();
        }
        
        // 保存用户偏好
        this.savePreferences({ model });
        
        this.$message.success(`已切换到${model === 'deepseek' ? 'DeepSeek' : '星火X1'}模型`);
      } catch (error) {
        console.error('切换模型失败:', error);
        this.$message.error('切换模型失败');
      }
    },
    
    async handleSendMessage(message) {
      if (!message.trim()) return;
      
      // 确保有当前会话
      if (!this.currentSessionId) {
        this.handleNewSession();
      }
      
      // 添加用户消息
      const userMessage = {
        role: MESSAGE_ROLES.USER,
        content: message.trim(),
        timestamp: new Date().toISOString()
      };
      
      this.currentMessages.push(userMessage);
      this.isLoading = true;
      
      try {
        // 准备发送给API的消息列表
        let messagesToSend = [...this.currentMessages];
        
        // 如果有智能体，添加系统提示
        if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
          const systemMessage = {
            role: MESSAGE_ROLES.SYSTEM,
            content: AGENT_CONFIG[this.currentAgent].systemPrompt,
            timestamp: new Date().toISOString()
          };
          messagesToSend = [systemMessage, ...messagesToSend];
        }
        
        // 调用API发送消息
        const response = await chatAPI.sendMessage({
          model: this.currentModel,
          messages: messagesToSend,
          agent_type: this.currentAgent,
          temperature: 0.7,
          max_tokens: 2000
        });
        
        // 添加AI回复
        this.currentMessages.push(response);
        
        // 保存到当前会话
        this.saveCurrentSession();
        
        // 如果是第一条消息，自动重命名会话
        if (this.currentMessages.length === 2) {
          this.autoRenameSession(message);
        }
        
      } catch (error) {
        console.error('发送消息失败:', error);
        
        // 显示错误消息
        let errorMessage = '发送消息失败，请重试';
        if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.code === 'TIMEOUT') {
          errorMessage = '请求超时，请重试';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.$message.error(errorMessage);
        
        // 移除用户消息（因为发送失败）
        this.currentMessages.pop();
        
      } finally {
        this.isLoading = false;
      }
    },
    
    // 自动重命名会话
    autoRenameSession(firstMessage) {
      try {
        if (this.currentSessionId && firstMessage) {
          let newName = firstMessage.slice(0, 20);
          if (firstMessage.length > 20) {
            newName += '...';
          }
          
          SessionManager.updateSession(this.sessions, this.currentSessionId, { name: newName });
          this.saveSessions();
        }
      } catch (error) {
        console.error('自动重命名失败:', error);
      }
    },
    
    // 保存会话到本地存储
    saveSessions() {
      try {
        const success = LocalStorage.saveSessions(this.sessions);
        if (!success) {
          console.warn('保存会话数据失败');
        }
      } catch (error) {
        console.error('保存会话失败:', error);
      }
    },
    
    // 保存当前会话消息
    saveCurrentSession() {
      try {
        if (this.currentSessionId) {
          const success = SessionManager.updateSession(
            this.sessions, 
            this.currentSessionId, 
            { 
              messages: this.currentMessages,
              messageCount: this.currentMessages.length
            }
          );
          
          if (success) {
            this.saveSessions();
          }
        }
      } catch (error) {
        console.error('保存当前会话失败:', error);
      }
    },
    
    // 保存用户偏好设置
    savePreferences(updates) {
      try {
        this.preferences = { ...this.preferences, ...updates };
        LocalStorage.savePreferences(updates);
      } catch (error) {
        console.error('保存偏好设置失败:', error);
      }
    },
    
    // 从本地存储加载数据
    loadData() {
      try {
        // 加载会话数据
        this.sessions = LocalStorage.getSessions();
        
        // 加载用户偏好
        this.preferences = LocalStorage.getPreferences();
        this.currentModel = this.preferences.model || 'deepseek';
        this.sidebarHidden = this.preferences.sidebarHidden || false;
        
        // 加载当前会话
        const savedSessionId = LocalStorage.getCurrentSessionId();
        if (savedSessionId && this.sessions.find(s => s.id === savedSessionId)) {
          this.handleLoadSession(savedSessionId);
        } else if (this.sessions.length > 0) {
          // 加载第一个会话
          this.handleLoadSession(this.sessions[0].id);
        } else {
          // 创建默认会话
          this.handleNewSession();
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        // 如果加载失败，创建新会话
        this.handleNewSession();
      }
    },
    
    // 处理智能体查询参数
    handleAgentQuery() {
      try {
        const agent = this.$route.query.agent;
        if (agent && AGENT_CONFIG[agent]) {
          // 创建新的智能体会话
          this.createAgentSession(agent);
          
          // 清除查询参数
          this.$router.replace({ path: '/' });
        }
      } catch (error) {
        console.error('处理智能体查询失败:', error);
      }
    },
    
    // 创建智能体会话
    createAgentSession(agentType) {
      try {
        const agentConfig = AGENT_CONFIG[agentType];
        if (!agentConfig) {
          throw new Error('未知的智能体类型');
        }
        
        const newSession = SessionManager.createSession(agentConfig.title, agentType);
        newSession.model = this.currentModel;
        
        this.sessions.unshift(newSession);
        this.currentSessionId = newSession.id;
        this.currentMessages = [];
        this.currentAgent = agentType;
        
        // 保存到本地存储
        this.saveSessions();
        LocalStorage.saveCurrentSessionId(newSession.id);
        
        // 显示提示
        this.$message.success(`已创建 ${agentConfig.title} 会话`);
      } catch (error) {
        console.error('创建智能体会话失败:', error);
        this.$message.error('创建智能体会话失败');
      }
    },

    // 检查API连接状态
    async checkAPIConnection() {
      try {
        const isHealthy = await chatAPI.healthCheck();
        if (!isHealthy) {
          this.$message.warning('无法连接到后端服务，将使用离线模式');
        }
      } catch (error) {
        console.warn('API健康检查失败:', error);
      }
    },

    // 处理重新生成消息
    async handleRegenerateMessage(messageToRegenerate) {
      try {
        if (this.isLoading) {
          this.$message.warning('请等待当前请求完成');
          return;
        }

        // 找到要重新生成的消息在列表中的位置
        const messageIndex = this.currentMessages.findIndex(m => 
          m.timestamp === messageToRegenerate.timestamp
        );
        
        if (messageIndex === -1) {
          this.$message.error('未找到要重新生成的消息');
          return;
        }

        // 移除从该消息开始的所有后续消息
        this.currentMessages = this.currentMessages.slice(0, messageIndex);
        
        // 获取上一条用户消息
        const lastUserMessage = [...this.currentMessages].reverse().find(m => m.role === MESSAGE_ROLES.USER);
        
        if (!lastUserMessage) {
          this.$message.error('未找到对应的用户消息');
          return;
        }

        this.isLoading = true;

        // 准备发送给API的消息列表
        let messagesToSend = [...this.currentMessages];
        
        // 如果有智能体，添加系统提示
        if (this.currentAgent && AGENT_CONFIG[this.currentAgent]) {
          const systemMessage = {
            role: MESSAGE_ROLES.SYSTEM,
            content: AGENT_CONFIG[this.currentAgent].systemPrompt,
            timestamp: new Date().toISOString()
          };
          messagesToSend = [systemMessage, ...messagesToSend];
        }
        
        // 调用API重新生成
        const response = await chatAPI.sendMessage({
          model: this.currentModel,
          messages: messagesToSend,
          agent_type: this.currentAgent,
          temperature: 0.8, // 稍微提高创造性
          max_tokens: 2000
        });
        
        // 添加新的AI回复
        this.currentMessages.push(response);
        
        // 保存到当前会话
        this.saveCurrentSession();
        
        this.$message.success('消息重新生成成功');
        
      } catch (error) {
        console.error('重新生成消息失败:', error);
        
        let errorMessage = '重新生成失败，请重试';
        if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.$message.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    // 处理收藏消息
    handleLikeMessage(data) {
      try {
        // 这里可以添加更多的收藏处理逻辑
        // 比如同步到服务器、显示在收藏列表等
        console.log('消息收藏状态更新:', data);
      } catch (error) {
        console.error('处理收藏消息失败:', error);
      }
    },

    // 处理开始对话
    handleStartChat() {
      try {
        // 聚焦到输入框
        this.$nextTick(() => {
          const chatInput = document.querySelector('.chat-input textarea, .chat-input input');
          if (chatInput) {
            chatInput.focus();
          }
        });
      } catch (error) {
        console.error('聚焦输入框失败:', error);
      }
    }
  },
  
  async mounted() {
    try {
      // 加载本地数据
      this.loadData();
      
      // 处理智能体选择
      this.handleAgentQuery();
      
      // 检查API连接（非阻塞）
      this.checkAPIConnection();
      
    } catch (error) {
      console.error('组件初始化失败:', error);
      this.$message.error('应用初始化失败');
    }
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding-left: 0;
  }
}
</style> 