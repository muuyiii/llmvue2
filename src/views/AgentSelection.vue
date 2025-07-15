<template>
  <div class="agent-selection">
    <div class="selection-container">
      <!-- 头部 -->
      <div class="selection-header">
        <h2>选择智能体</h2>
        <p>选择一个专业智能体来协助您完成任务</p>
      </div>
      
      <!-- 智能体列表 -->
      <div class="agent-list">
        <!-- 通用智能体选项 -->
        <AgentCard 
          :agent="generalAgent"
          :is-selected="selectedAgent === null"
          @select="handleAgentSelect"
        />
        
        <!-- 专业智能体列表 -->
        <AgentCard 
          v-for="agent in agents"
          :key="agent.type"
          :agent="agent"
          :is-selected="selectedAgent === agent.type"
          @select="handleAgentSelect"
        />
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="handleCancel" size="medium">
          <i class="el-icon-arrow-left"></i>
          返回
        </el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm" 
          size="medium"
          :loading="isConfirming"
        >
          <i class="el-icon-check"></i>
          确认选择
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import AgentCard from '@/components/AgentCard'
import { AGENT_CONFIG, AGENTS } from '@/utils/constants'

export default {
  name: 'AgentSelection',
  components: {
    AgentCard
  },
  data() {
    return {
      selectedAgent: null,
      isConfirming: false
    }
  },
  computed: {
    // 通用智能体选项
    generalAgent() {
      return {
        type: null,
        title: '通用AI助手',
        description: '多功能AI助手，可以回答各类问题和提供帮助',
        icon: 'el-icon-service'
      }
    },
    
    // 专业智能体列表
    agents() {
      return Object.keys(AGENT_CONFIG).map(agentType => ({
        type: agentType,
        ...AGENT_CONFIG[agentType]
      }))
    }
  },
  methods: {
    handleAgentSelect(agentType) {
      this.selectedAgent = agentType;
    },
    
    handleCancel() {
      this.$router.push('/');
    },
    
    async handleConfirm() {
      if (this.isConfirming) return;
      
      try {
        this.isConfirming = true;
        
        // 添加一点延迟，提供更好的用户反馈
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (this.selectedAgent) {
          // 选择了专业智能体，通过路由参数传递
          this.$router.push({
            path: '/',
            query: { agent: this.selectedAgent }
          });
        } else {
          // 选择了通用助手，直接跳转
          this.$router.push('/');
        }
        
      } catch (error) {
        console.error('确认选择失败:', error);
        this.$message.error('操作失败，请重试');
      } finally {
        this.isConfirming = false;
      }
    },
    
    // 键盘快捷键支持
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.handleCancel();
      } else if (event.key === 'Enter') {
        this.handleConfirm();
      } else if (event.key >= '1' && event.key <= '9') {
        const index = parseInt(event.key) - 1;
        const allOptions = [this.generalAgent, ...this.agents];
        if (index < allOptions.length) {
          this.handleAgentSelect(allOptions[index].type);
        }
      }
    }
  },
  
  mounted() {
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeydown);
    
    // 检查是否有预选的智能体
    const preselectedAgent = this.$route.query.preselect;
    if (preselectedAgent && Object.keys(AGENT_CONFIG).includes(preselectedAgent)) {
      this.selectedAgent = preselectedAgent;
    }
  },
  
  beforeDestroy() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeydown);
  }
}
</script>

<style scoped>
.agent-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.selection-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  min-width: 480px;
  max-width: 600px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selection-header {
  text-align: center;
  margin-bottom: 30px;
}

.selection-header h2 {
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.selection-header p {
  color: #909399;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 30px 0;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons .el-button {
  flex: 1;
  min-height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.action-buttons .el-button i {
  margin-right: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .agent-selection {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .selection-container {
    min-width: auto;
    padding: 24px;
    margin: 0;
  }
  
  .selection-header h2 {
    font-size: 24px;
  }
  
  .selection-header p {
    font-size: 14px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .selection-container {
    background: #2c2c2c;
    color: #ffffff;
  }
  
  .selection-header h2 {
    color: #ffffff;
  }
  
  .selection-header p {
    color: #cccccc;
  }
  
  .action-buttons {
    border-top-color: #404040;
  }
}
</style> 