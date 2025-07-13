<template>
  <div class="session-item" :class="{ 'current': isCurrent }" @click="handleLoad">
    <div class="session-info">
      <div class="session-name">{{ session.name || getDefaultName() }}</div>
      <div class="session-time">{{ formatTime(session.created) }}</div>
    </div>
    
    <div class="session-actions" @click.stop>
      <el-dropdown trigger="click">
        <el-button size="mini" type="text" icon="el-icon-more"/>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleRename">重命名</el-dropdown-item>
          <el-dropdown-item @click.native="handleDelete">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
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
  methods: {
    handleLoad() {
      this.$emit('load', this.session.id);
    },
    
    handleRename() {
      const newName = prompt('请输入新的会话名称:', this.session.name);
      if (newName !== null && newName.trim() !== '') {
        this.$emit('rename', this.session.id, newName.trim());
      }
    },
    
    handleDelete() {
      if (confirm('确定要删除这个会话吗？')) {
        this.$emit('delete', this.session.id);
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getDefaultName() {
      return `会话${this.session.id.slice(-4)}`;
    }
  }
}
</script>

<style scoped>
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #e6f7ff;
}

.session-item.current {
  background-color: #1890ff;
  color: white;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.session-time {
  font-size: 12px;
  opacity: 0.7;
}

.session-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}
</style> 