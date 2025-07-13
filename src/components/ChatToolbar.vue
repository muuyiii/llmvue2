<template>
  <div class="chat-toolbar">
    <!-- 左侧操作按钮 -->
    <div class="toolbar-left">
      <el-button 
        @click="handleToggleSidebar"
        icon="el-icon-s-fold"
        size="small"
      >
        {{ sidebarHidden ? '展开' : '收起' }}侧边栏
      </el-button>
      
      <el-button 
        @click="handleOpenAgentSelection"
        icon="el-icon-user"
        size="small"
        type="primary"
      >
        新建智能体
      </el-button>
    </div>
    
    <!-- 右侧模型选择器 -->
    <div class="toolbar-right">
      <!-- 当前智能体显示 -->
      <div v-if="currentAgent" class="current-agent">
        <el-tag type="success">{{ getAgentName(currentAgent) }}</el-tag>
      </div>
      
      <!-- 模型选择器 -->
      <el-select 
        v-model="selectedModel" 
        @change="handleModelChange"
        size="small"
        placeholder="选择模型"
      >
        <el-option 
          v-for="model in models"
          :key="model.value"
          :label="model.label"
          :value="model.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatToolbar',
  props: {
    currentModel: {
      type: String,
      default: 'deepseek'
    },
    currentAgent: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      selectedModel: this.currentModel,
      sidebarHidden: false,
      models: [
        { label: 'DeepSeek', value: 'deepseek' },
        { label: '星火X1', value: 'x1' }
      ]
    }
  },
  methods: {
    handleToggleSidebar() {
      this.sidebarHidden = !this.sidebarHidden;
      this.$emit('toggle-sidebar');
    },
    
    handleOpenAgentSelection() {
      this.$emit('open-agent-selection');
    },
    
    handleModelChange(model) {
      this.$emit('model-change', model);
    },
    
    getAgentName(agentType) {
      const agentNames = {
        'translate': '中译英助手',
        'summarize': '文章总结助手'
      };
      return agentNames[agentType] || '智能体';
    }
  }
}
</script>

<style scoped>
.chat-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-agent {
  display: flex;
  align-items: center;
}
</style> 