<template>
  <div class="agent-card" :class="{ 'selected': isSelected }" @click="handleSelect">
    <div class="agent-icon">
      <el-icon :class="agent.icon" size="24"/>
    </div>
    
    <div class="agent-info">
      <div class="agent-title">{{ agent.title }}</div>
      <div class="agent-description">{{ agent.description }}</div>
    </div>
    
    <div class="agent-status">
      <el-radio :value="isSelected"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentCard',
  props: {
    agent: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelect() {
      this.$emit('select', this.agent.type);
    }
  }
}
</script>

<style scoped>
.agent-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.agent-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.agent-card.selected {
  border-color: #1890ff;
  background-color: #f0f9ff;
}

.agent-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 50%;
  color: #1890ff;
}

.agent-info {
  flex: 1;
}

.agent-title {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.agent-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.agent-status {
  display: flex;
  align-items: center;
}
</style> 