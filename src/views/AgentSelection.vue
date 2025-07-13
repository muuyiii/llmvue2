<template>
  <div class="agent-selection">
    <div class="selection-container">
      <h2>选择智能体</h2>
      
      <!-- 智能体列表 -->
             <div class="agent-list">
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
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!selectedAgent">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import AgentCard from '@/components/AgentCard'

export default {
  name: 'AgentSelection',
  components: {
    AgentCard
  },
  data() {
    return {
      selectedAgent: null,
      agents: [
        {
          type: 'translate',
          title: '中英文翻译智能体',
          description: '将中文文本翻译成英文，保持原意准确',
          icon: 'el-icon-refresh'
        },
        {
          type: 'summarize',
          title: '文章总结智能体',
          description: '提取文章主要内容，生成简洁摘要',
          icon: 'el-icon-document'
        }
      ]
    }
  },
  methods: {
    handleAgentSelect(agentType) {
      this.selectedAgent = agentType;
    },
    
    handleCancel() {
      this.$router.push('/');
    },
    
    handleConfirm() {
      if (this.selectedAgent) {
        // 通过路由参数传递选中的智能体
        this.$router.push({
          path: '/',
          query: { agent: this.selectedAgent }
        });
      }
    }
  }
}
</script>

<style scoped>
.agent-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.selection-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 400px;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 