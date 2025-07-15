<template>
  <div class="chat-toolbar">
    <!-- 左侧操作按钮 -->
    <div class="toolbar-left">
      <el-button 
        @click="handleToggleSidebar"
        :icon="sidebarIcon"
        size="small"
        circle
        :title="sidebarTooltip"
      />
      
      <el-divider direction="vertical" />
      
      <el-button 
        @click="handleNewSession"
        icon="el-icon-plus"
        size="small"
        type="primary"
        title="新建会话"
      >
        新建会话
      </el-button>
      
      <el-button 
        @click="handleOpenAgentSelection"
        icon="el-icon-user"
        size="small"
        title="选择智能体"
      >
        选择智能体
      </el-button>
      
      <!-- 更多操作 -->
      <el-dropdown @command="handleMenuCommand" trigger="click">
        <el-button size="small" icon="el-icon-more" circle title="更多操作"/>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="export">
            <i class="el-icon-download"></i>
            导出会话
          </el-dropdown-item>
          <el-dropdown-item command="import">
            <i class="el-icon-upload2"></i>
            导入会话
          </el-dropdown-item>
          <el-dropdown-item command="clear" divided>
            <i class="el-icon-delete"></i>
            清空所有数据
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    
    <!-- 中间状态显示 -->
    <div class="toolbar-center">
      <!-- 当前智能体显示 -->
      <div v-if="currentAgent" class="current-agent">
        <el-tag 
          :type="getAgentTagType(currentAgent)"
          size="small"
          :color="getAgentColor(currentAgent)"
        >
          <i :class="getAgentIcon(currentAgent)"></i>
          {{ getAgentName(currentAgent) }}
        </el-tag>
      </div>
      
      <!-- 连接状态 -->
      <div class="connection-status">
        <el-tag 
          :type="connectionStatus.type"
          size="mini"
          :title="connectionStatus.tooltip"
        >
          <i :class="connectionStatus.icon"></i>
          {{ connectionStatus.text }}
        </el-tag>
      </div>
    </div>
    
    <!-- 右侧模型选择器和设置 -->
    <div class="toolbar-right">
      <!-- 模型选择器 -->
      <div class="model-selector">
        <span class="model-label">模型:</span>
        <el-select 
          v-model="selectedModel" 
          @change="handleModelChange"
          size="small"
          placeholder="选择模型"
          style="width: 120px"
        >
          <el-option 
            v-for="model in availableModels"
            :key="model.value"
            :label="model.label"
            :value="model.value"
            :disabled="!model.available"
          >
            <span style="float: left">{{ model.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              <i v-if="!model.available" class="el-icon-warning" title="模型不可用"></i>
              <i v-else class="el-icon-check" style="color: #67c23a"></i>
            </span>
          </el-option>
        </el-select>
      </div>
      
      <!-- 设置按钮 -->
      <el-popover
        placement="bottom-end"
        width="300"
        trigger="click"
        v-model="showSettings"
      >
        <div class="settings-panel">
          <h4>设置</h4>
          
          <!-- 主题设置 -->
          <div class="setting-item">
            <label>主题:</label>
            <el-radio-group v-model="settings.theme" size="mini" @change="handleThemeChange">
              <el-radio-button label="light">浅色</el-radio-button>
              <el-radio-button label="dark">深色</el-radio-button>
              <el-radio-button label="auto">自动</el-radio-button>
            </el-radio-group>
          </div>
          
          <!-- 自动保存设置 -->
          <div class="setting-item">
            <label>自动保存:</label>
            <el-switch 
              v-model="settings.autoSave"
              @change="handleAutoSaveChange"
            />
          </div>
          
          <!-- 消息提示音 -->
          <div class="setting-item">
            <label>消息提示音:</label>
            <el-switch 
              v-model="settings.messageSound"
              @change="handleMessageSoundChange"
            />
          </div>
          
          <!-- 快捷键说明 -->
          <div class="setting-item">
            <el-button size="mini" @click="showShortcuts = true">
              <i class="el-icon-question"></i>
              快捷键说明
            </el-button>
          </div>
        </div>
        
        <el-button 
          slot="reference"
          size="small"
          icon="el-icon-setting"
          circle
          title="设置"
        />
      </el-popover>
    </div>
    
    <!-- 快捷键说明对话框 -->
    <el-dialog
      title="快捷键说明"
      :visible.sync="showShortcuts"
      width="400px"
      center
    >
      <div class="shortcuts-help">
        <div class="shortcut-item">
          <kbd>Enter</kbd>
          <span>发送消息</span>
        </div>
        <div class="shortcut-item">
          <kbd>Shift + Enter</kbd>
          <span>换行</span>
        </div>
        <div class="shortcut-item">
          <kbd>↑ / ↓</kbd>
          <span>历史消息</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl + N</kbd>
          <span>新建会话</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl + K</kbd>
          <span>清空输入</span>
        </div>
        <div class="shortcut-item">
          <kbd>Esc</kbd>
          <span>取消操作</span>
        </div>
      </div>
    </el-dialog>
    
    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleImportFile"
    />
  </div>
</template>

<script>
import { MODEL_CONFIG, AGENT_CONFIG } from '@/utils/constants'
import { LocalStorage } from '@/utils/storage'

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
    },
    sidebarHidden: {
      type: Boolean,
      default: false
    },
    isConnected: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedModel: this.currentModel,
      showSettings: false,
      showShortcuts: false,
      settings: {
        theme: 'light',
        autoSave: true,
        messageSound: true
      }
    }
  },
  computed: {
    sidebarIcon() {
      return this.sidebarHidden ? 'el-icon-s-unfold' : 'el-icon-s-fold'
    },
    
    sidebarTooltip() {
      return this.sidebarHidden ? '展开侧边栏' : '收起侧边栏'
    },
    
    availableModels() {
      return Object.values(MODEL_CONFIG).map(model => ({
        label: model.label,
        value: model.value,
        available: true // 这里可以根据实际情况设置模型可用性
      }))
    },
    
    connectionStatus() {
      if (this.isConnected) {
        return {
          type: 'success',
          icon: 'el-icon-success',
          text: '已连接',
          tooltip: 'API连接正常'
        }
      } else {
        return {
          type: 'warning',
          icon: 'el-icon-warning',
          text: '离线模式',
          tooltip: '无法连接到后端服务'
        }
      }
    }
  },
  methods: {
    handleToggleSidebar() {
      this.$emit('toggle-sidebar')
    },
    
    handleNewSession() {
      this.$emit('new-session')
    },
    
    handleOpenAgentSelection() {
      this.$emit('open-agent-selection')
    },
    
    handleModelChange(model) {
      this.$emit('model-change', model)
    },
    
    handleMenuCommand(command) {
      switch (command) {
        case 'export':
          this.handleExportSessions()
          break
        case 'import':
          this.handleImportSessions()
          break
        case 'clear':
          this.handleClearAllData()
          break
      }
    },
    
    handleExportSessions() {
      try {
        const data = LocalStorage.exportData()
        if (data) {
          const blob = new Blob([data], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `llmvue2-export-${new Date().toISOString().slice(0, 10)}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          this.$message.success('会话数据导出成功')
        }
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
    },
    
    handleImportSessions() {
      this.$refs.fileInput.click()
    },
    
    handleImportFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const success = LocalStorage.importData(e.target.result)
          if (success) {
            this.$message.success('会话数据导入成功，请刷新页面')
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          } else {
            this.$message.error('导入失败，数据格式不正确')
          }
        } catch (error) {
          console.error('导入失败:', error)
          this.$message.error('导入失败，请检查文件格式')
        }
      }
      reader.readAsText(file)
      
      // 清空输入
      event.target.value = ''
    },
    
    handleClearAllData() {
      this.$confirm('确定要清空所有数据吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const success = LocalStorage.clearAll()
        if (success) {
          this.$message.success('数据已清空，即将刷新页面')
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          this.$message.error('清空失败')
        }
      }).catch(() => {
        // 用户取消
      })
    },
    
    handleThemeChange(theme) {
      LocalStorage.savePreferences({ theme })
      this.$message.info('主题设置已保存')
      // 这里可以实现主题切换逻辑
    },
    
    handleAutoSaveChange(autoSave) {
      LocalStorage.savePreferences({ autoSave })
      this.$message.info('自动保存设置已更新')
    },
    
    handleMessageSoundChange(messageSound) {
      LocalStorage.savePreferences({ messageSound })
      this.$message.info('消息提示音设置已更新')
    },
    
    getAgentName(agentType) {
      return AGENT_CONFIG[agentType]?.title || '智能体'
    },
    
    getAgentIcon(agentType) {
      return AGENT_CONFIG[agentType]?.icon || 'el-icon-service'
    },
    
    getAgentTagType(agentType) {
      const types = {
        'translate': 'success',
        'summarize': 'warning'
      }
      return types[agentType] || 'info'
    },
    
    getAgentColor(agentType) {
      const colors = {
        'translate': '#67C23A',
        'summarize': '#E6A23C'
      }
      return colors[agentType] || '#909399'
    },
    
    loadSettings() {
      try {
        const preferences = LocalStorage.getPreferences()
        this.settings = {
          theme: preferences.theme || 'light',
          autoSave: preferences.autoSave !== false,
          messageSound: preferences.messageSound !== false
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
  },
  
  watch: {
    currentModel(newVal) {
      this.selectedModel = newVal
    }
  },
  
  mounted() {
    // 加载用户设置
    this.loadSettings()
    
    // 添加全局快捷键
    document.addEventListener('keydown', this.handleGlobalKeydown)
  },
  
  beforeDestroy() {
    // 移除全局快捷键监听
    document.removeEventListener('keydown', this.handleGlobalKeydown)
  },
  
  methods: {
    ...this.methods,
    
    handleGlobalKeydown(event) {
      // Ctrl+N: 新建会话
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault()
        this.handleNewSession()
      }
      // Ctrl+K: 清空输入（由ChatInput处理）
      // Esc: 关闭所有弹窗
      else if (event.key === 'Escape') {
        this.showSettings = false
        this.showShortcuts = false
      }
    }
  }
}
</script>

<style scoped>
.chat-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  min-height: 60px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-agent {
  display: flex;
  align-items: center;
}

.current-agent .el-tag {
  font-size: 12px;
}

.current-agent .el-tag i {
  margin-right: 4px;
}

.connection-status .el-tag {
  border: none;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.settings-panel {
  padding: 8px 0;
}

.settings-panel h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #303133;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-size: 13px;
  color: #606266;
  margin-right: 12px;
}

.shortcuts-help {
  max-height: 300px;
  overflow-y: auto;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.shortcut-item:last-child {
  border-bottom: none;
}

.shortcut-item kbd {
  background-color: #f5f5f5;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: monospace;
  color: #333;
}

.shortcut-item span {
  font-size: 13px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-toolbar {
    padding: 8px 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex: none;
  }
  
  .toolbar-center {
    order: 3;
    width: 100%;
    margin-top: 8px;
  }
  
  .model-label {
    display: none;
  }
  
  .settings-panel {
    width: 250px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .chat-toolbar {
    background: #2c2c2c;
    color: #ffffff;
    border-bottom-color: #404040;
  }
  
  .model-label {
    color: #cccccc;
  }
  
  .settings-panel {
    background: #2c2c2c;
    color: #ffffff;
  }
  
  .setting-item label {
    color: #cccccc;
  }
  
  .shortcut-item kbd {
    background-color: #404040;
    border-color: #606060;
    color: #ffffff;
  }
  
  .shortcut-item span {
    color: #cccccc;
  }
}
</style> 