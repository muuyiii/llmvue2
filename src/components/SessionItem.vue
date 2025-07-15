<template>
  <div class="session-item" :class="{ 'current': isCurrent }" @click="handleLoad">
    <!-- 智能体标识 -->
    <div v-if="session.agentType" class="agent-indicator">
      <i :class="getAgentIcon(session.agentType)" :style="{ color: getAgentColor(session.agentType) }"></i>
    </div>
    
    <!-- 会话信息 -->
    <div class="session-info">
      <div class="session-name" :title="session.name || getDefaultName()">
        {{ session.name || getDefaultName() }}
      </div>
      <div class="session-meta">
        <span class="session-time">{{ formatTime(session.lastUpdated || session.created) }}</span>
        <span v-if="messageCount > 0" class="message-count">{{ messageCount }}条消息</span>
      </div>
    </div>
    
    <!-- 会话操作 -->
    <div class="session-actions" @click.stop>
      <el-dropdown 
        trigger="click" 
        @command="handleCommand"
        placement="bottom-end"
      >
        <el-button 
          size="mini" 
          type="text" 
          icon="el-icon-more"
          class="action-button"
        />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="rename">
            <i class="el-icon-edit"></i>
            重命名
          </el-dropdown-item>
          <el-dropdown-item command="export">
            <i class="el-icon-download"></i>
            导出会话
          </el-dropdown-item>
          <el-dropdown-item command="duplicate">
            <i class="el-icon-copy-document"></i>
            复制会话
          </el-dropdown-item>
          <el-dropdown-item command="pin" v-if="!session.pinned">
            <i class="el-icon-star-off"></i>
            置顶会话
          </el-dropdown-item>
          <el-dropdown-item command="unpin" v-if="session.pinned">
            <i class="el-icon-star-on"></i>
            取消置顶
          </el-dropdown-item>
          <el-dropdown-item command="delete" divided>
            <i class="el-icon-delete" style="color: #f56c6c"></i>
            <span style="color: #f56c6c">删除会话</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    
    <!-- 置顶标识 -->
    <div v-if="session.pinned" class="pinned-indicator">
      <i class="el-icon-star-on"></i>
    </div>
    
    <!-- 重命名输入框 -->
    <el-dialog
      title="重命名会话"
      :visible.sync="showRenameDialog"
      width="400px"
      center
      :close-on-click-modal="false"
    >
      <el-input
        ref="renameInput"
        v-model="newName"
        placeholder="请输入新的会话名称"
        @keyup.enter.native="confirmRename"
        maxlength="50"
        show-word-limit
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelRename">取 消</el-button>
        <el-button type="primary" @click="confirmRename" :disabled="!newName.trim()">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { SessionManager } from '@/utils/storage'
import { AGENT_CONFIG } from '@/utils/constants'

export default {
  name: 'SessionItem',
  props: {
    session: {
      type: Object,
      required: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showRenameDialog: false,
      newName: ''
    }
  },
  computed: {
    messageCount() {
      return this.session.messages?.length || 0
    },
    
    sessionStats() {
      return SessionManager.getSessionStats(this.session)
    }
  },
  methods: {
    handleLoad() {
      if (!this.isCurrent) {
        this.$emit('load', this.session.id)
      }
    },
    
    handleCommand(command) {
      switch (command) {
        case 'rename':
          this.handleRename()
          break
        case 'export':
          this.handleExport()
          break
        case 'duplicate':
          this.handleDuplicate()
          break
        case 'pin':
          this.handlePin(true)
          break
        case 'unpin':
          this.handlePin(false)
          break
        case 'delete':
          this.handleDelete()
          break
      }
    },
    
    handleRename() {
      this.newName = this.session.name || this.getDefaultName()
      this.showRenameDialog = true
      
      // 聚焦输入框
      this.$nextTick(() => {
        this.$refs.renameInput.focus()
        this.$refs.renameInput.select()
      })
    },
    
    confirmRename() {
      if (this.newName.trim() && this.newName.trim() !== this.session.name) {
        this.$emit('rename', this.session.id, this.newName.trim())
        this.$message.success('会话重命名成功')
      }
      this.showRenameDialog = false
    },
    
    cancelRename() {
      this.showRenameDialog = false
      this.newName = ''
    },
    
    handleDelete() {
      const sessionName = this.session.name || this.getDefaultName()
      this.$confirm(
        `确定要删除会话"${sessionName}"吗？删除后无法恢复！`, 
        '删除会话', 
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      ).then(() => {
        this.$emit('delete', this.session.id)
        this.$message.success('会话删除成功')
      }).catch(() => {
        // 用户取消删除
      })
    },
    
    handleExport() {
      try {
        const sessionData = {
          session: this.session,
          exportTime: new Date().toISOString(),
          version: '1.0'
        }
        
        const dataStr = JSON.stringify(sessionData, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `session-${this.session.id}-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        URL.revokeObjectURL(url)
        this.$message.success('会话导出成功')
      } catch (error) {
        console.error('导出会话失败:', error)
        this.$message.error('导出失败')
      }
    },
    
    handleDuplicate() {
      try {
        const duplicatedSession = {
          ...this.session,
          id: Date.now().toString(),
          name: `${this.session.name || this.getDefaultName()} - 副本`,
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
        
        this.$emit('duplicate', duplicatedSession)
        this.$message.success('会话复制成功')
      } catch (error) {
        console.error('复制会话失败:', error)
        this.$message.error('复制失败')
      }
    },
    
    handlePin(pinned) {
      this.$emit('pin', this.session.id, pinned)
      this.$message.success(pinned ? '会话已置顶' : '已取消置顶')
    },
    
    formatTime(timestamp) {
      return SessionManager.formatTime(timestamp)
    },
    
    getDefaultName() {
      if (this.session.agentType && AGENT_CONFIG[this.session.agentType]) {
        return AGENT_CONFIG[this.session.agentType].title
      }
      return `会话${this.session.id.slice(-4)}`
    },
    
    getAgentIcon(agentType) {
      return AGENT_CONFIG[agentType]?.icon || 'el-icon-service'
    },
    
    getAgentColor(agentType) {
      const colors = {
        'translate': '#67C23A',
        'summarize': '#E6A23C'
      }
      return colors[agentType] || '#909399'
    }
  }
}
</script>

<style scoped>
.session-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.session-item:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.session-item.current {
  background-color: #ecf5ff;
  border-color: #409EFF;
  color: #409EFF;
}

.session-item.current .session-name {
  color: #409EFF;
  font-weight: 500;
}

.agent-indicator {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.session-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
  transition: color 0.2s ease;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #909399;
}

.session-time {
  flex-shrink: 0;
}

.message-count {
  flex-shrink: 0;
  padding: 1px 4px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 10px;
}

.session-item.current .message-count {
  background: #e6f7ff;
  color: #409EFF;
}

.session-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-item.current .session-actions {
  opacity: 1;
}

.action-button {
  padding: 4px;
  margin: 0;
  border-radius: 4px;
}

.action-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.pinned-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #E6A23C;
  font-size: 12px;
}

.dialog-footer {
  text-align: right;
}

/* 置顶会话样式 */
.session-item[data-pinned="true"] {
  background-color: #fffbf0;
  border-color: #E6A23C;
}

.session-item[data-pinned="true"]:hover {
  background-color: #fef9e7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-item {
    padding: 10px 6px;
  }
  
  .session-name {
    font-size: 13px;
  }
  
  .session-meta {
    font-size: 10px;
  }
  
  .agent-indicator {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .session-item {
    color: #ffffff;
  }
  
  .session-item:hover {
    background-color: #404040;
    border-color: #606060;
  }
  
  .session-item.current {
    background-color: #1a3a5c;
    border-color: #409EFF;
  }
  
  .session-meta {
    color: #cccccc;
  }
  
  .message-count {
    background: #404040;
    color: #cccccc;
  }
  
  .session-item.current .message-count {
    background: #1a3a5c;
    color: #409EFF;
  }
  
  .action-button:hover {
    background-color: rgba(64, 158, 255, 0.2);
  }
}
</style> 