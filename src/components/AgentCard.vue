<template>
  <div class="agent-card" :class="cardClasses" @click="handleSelect">
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 智能体图标 -->
      <div class="agent-icon" :style="{ backgroundColor: agentColor }">
        <i :class="agent.icon" :style="{ color: iconColor }"></i>
      </div>
      
      <!-- 智能体信息 -->
      <div class="agent-info">
        <div class="agent-title">{{ agent.title }}</div>
        <div class="agent-description">{{ agent.description }}</div>
        
        <!-- 特性标签 -->
        <div v-if="agentTags.length > 0" class="agent-tags">
          <el-tag 
            v-for="tag in agentTags"
            :key="tag"
            size="mini"
            :type="tagType"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 选择状态 -->
    <div class="selection-indicator">
      <transition name="check-fade">
        <i v-if="isSelected" class="el-icon-check selection-check"></i>
      </transition>
      <div class="selection-ring" :class="{ 'selected': isSelected }"></div>
    </div>
    
    <!-- 悬停效果 -->
    <div class="hover-overlay">
      <div class="hover-content">
        <i class="el-icon-right hover-arrow"></i>
        <span>选择此智能体</span>
      </div>
    </div>
  </div>
</template>

<script>
import { AGENT_CONFIG } from '@/utils/constants'

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
  computed: {
    cardClasses() {
      return {
        'selected': this.isSelected,
        'general-agent': this.agent.type === null,
        'specialized-agent': this.agent.type !== null
      }
    },
    
    agentColor() {
      if (this.agent.type === null) {
        return '#409EFF' // 通用智能体蓝色
      }
      
      const colors = {
        'translate': '#67C23A',
        'summarize': '#E6A23C'
      }
      return colors[this.agent.type] || '#909399'
    },
    
    iconColor() {
      return this.isSelected ? '#ffffff' : this.agentColor
    },
    
    agentTags() {
      if (this.agent.type === null) {
        return ['通用', '多功能']
      }
      
      const tags = {
        'translate': ['翻译', '语言处理'],
        'summarize': ['总结', '文本分析']
      }
      return tags[this.agent.type] || []
    },
    
    tagType() {
      if (this.agent.type === null) {
        return 'primary'
      }
      
      const types = {
        'translate': 'success',
        'summarize': 'warning'
      }
      return types[this.agent.type] || 'info'
    }
  },
  methods: {
    handleSelect() {
      // 添加点击动画
      this.$el.style.transform = 'scale(0.98)'
      setTimeout(() => {
        this.$el.style.transform = ''
      }, 150)
      
      this.$emit('select', this.agent.type)
    }
  }
}
</script>

<style scoped>
.agent-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e6e6e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  overflow: hidden;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.agent-card:hover::before {
  left: 100%;
}

.agent-card:hover {
  border-color: #409EFF;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.agent-card.selected {
  border-color: #409EFF;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.agent-card.general-agent.selected {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.agent-card.specialized-agent.selected {
  background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  z-index: 2;
  position: relative;
}

.agent-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.agent-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  opacity: 0.1;
  border-radius: inherit;
}

.agent-card.selected .agent-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.agent-card.selected .agent-title {
  color: #409EFF;
}

.agent-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.agent-card.selected .agent-description {
  color: #409EFF;
}

.agent-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.agent-tags .el-tag {
  border: none;
  font-size: 11px;
  padding: 2px 6px;
}

.selection-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  z-index: 2;
}

.selection-ring {
  width: 20px;
  height: 20px;
  border: 2px solid #dcdfe6;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: absolute;
  top: 2px;
  left: 2px;
}

.selection-ring.selected {
  border-color: #409EFF;
  background: #409EFF;
}

.selection-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.agent-card:hover .hover-overlay {
  opacity: 1;
}

.agent-card.selected .hover-overlay {
  opacity: 0;
}

.hover-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  font-size: 14px;
  font-weight: 500;
}

.hover-arrow {
  font-size: 16px;
  animation: bounce-right 1s infinite;
}

/* 动画效果 */
@keyframes bounce-right {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(2px);
  }
}

.check-fade-enter-active, .check-fade-leave-active {
  transition: all 0.3s ease;
}

.check-fade-enter, .check-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .agent-card {
    padding: 16px;
  }
  
  .card-content {
    gap: 12px;
  }
  
  .agent-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .agent-title {
    font-size: 15px;
  }
  
  .agent-description {
    font-size: 12px;
  }
  
  .selection-indicator {
    width: 20px;
    height: 20px;
  }
  
  .selection-ring {
    width: 16px;
    height: 16px;
    top: 2px;
    left: 2px;
  }
  
  .selection-check {
    font-size: 10px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .agent-card {
    background: linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 100%);
    border-color: #404040;
    color: #ffffff;
  }
  
  .agent-card:hover {
    border-color: #409EFF;
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  }
  
  .agent-card.selected {
    background: linear-gradient(135deg, #1a3a5c 0%, #2c2c2c 100%);
  }
  
  .agent-title {
    color: #ffffff;
  }
  
  .agent-card.selected .agent-title {
    color: #409EFF;
  }
  
  .agent-description {
    color: #cccccc;
  }
  
  .agent-card.selected .agent-description {
    color: #79bbff;
  }
  
  .selection-ring {
    border-color: #606060;
  }
  
  .hover-overlay {
    background: rgba(64, 158, 255, 0.1);
  }
}

/* 动画性能优化 */
.agent-card {
  will-change: transform;
}

.agent-icon {
  will-change: transform;
}
</style> 