# llmvue2 - 智能体聊天应用

> 基于Vue.js 2.x开发的智能体聊天应用前端项目

## 项目结构

```
llmvue2/
├── src/
│   ├── main.js                 # 应用入口文件
│   ├── App.vue                 # 根组件
│   ├── router/                 # 路由配置
│   │   └── index.js
│   ├── views/                  # 页面组件
│   │   ├── ChatInterface.vue   # 聊天界面主页面
│   │   └── AgentSelection.vue  # 智能体选择页面
│   ├── components/             # 公共组件
│   │   ├── ChatSidebar.vue     # 聊天侧边栏
│   │   ├── ChatToolbar.vue     # 聊天工具栏
│   │   ├── ChatContainer.vue   # 聊天消息容器
│   │   ├── ChatInput.vue       # 聊天输入框
│   │   ├── MessageItem.vue     # 消息项组件
│   │   ├── SessionItem.vue     # 会话项组件
│   │   └── AgentCard.vue       # 智能体卡片组件
│   ├── api/                    # API接口
│   │   └── chat.js             # 聊天相关API
│   └── utils/                  # 工具函数
│       ├── storage.js          # 本地存储工具
│       └── constants.js        # 常量定义
├── config/                     # 配置文件
│   ├── index.js               # 主配置文件
│   ├── dev.env.js             # 开发环境配置
│   └── prod.env.js            # 生产环境配置
├── index.html                  # HTML模板
├── package.json               # 项目依赖配置
└── README.md                  # 项目说明文档
```

## 功能特性

### 🎯 核心功能
- **多模型支持**: 支持DeepSeek和星火X1两种AI模型
- **智能体系统**: 内置翻译和总结两种专业智能体
- **会话管理**: 完整的会话创建、保存、重命名、删除功能
- **消息交互**: 实时聊天界面，支持消息发送和接收
- **本地存储**: 会话数据持久化保存

### 🔧 技术特点
- **Vue 2.x**: 采用Vue.js 2.x框架开发
- **Element UI**: 使用Element UI组件库
- **组件化**: 高度模块化的组件设计
- **响应式**: 移动端友好的响应式设计
- **TypeScript Ready**: 预留TypeScript支持

### 📱 界面设计
- **侧边栏**: 可折叠的会话历史侧边栏
- **工具栏**: 模型切换和智能体选择工具栏
- **聊天区域**: 清晰的消息展示区域
- **输入框**: 支持多行输入和快捷键发送

## 开发环境搭建

### 环境要求
- Node.js >= 6.0.0
- npm >= 3.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 组件说明

### 视图组件 (Views)
- **ChatInterface**: 聊天界面主页面，整合所有子组件
- **AgentSelection**: 智能体选择页面，支持智能体切换

### 核心组件 (Components)
- **ChatSidebar**: 侧边栏组件，管理会话历史
- **ChatToolbar**: 工具栏组件，提供模型和智能体切换
- **ChatContainer**: 消息容器组件，展示聊天内容
- **ChatInput**: 输入框组件，处理用户输入
- **MessageItem**: 消息项组件，单条消息展示
- **SessionItem**: 会话项组件，会话列表项
- **AgentCard**: 智能体卡片组件，智能体选择界面

### 工具模块 (Utils)
- **storage.js**: 本地存储工具类，处理数据持久化
- **constants.js**: 常量定义，统一管理配置项
- **chat.js**: API接口封装，处理后端通信

## API接口

### 聊天接口
- `POST /chat` - 发送消息
- `GET /models` - 获取模型列表
- `GET /agents` - 获取智能体列表

### 数据格式
```javascript
// 发送消息
{
  model: 'deepseek',
  messages: [...],
  agent_type: 'translate'
}

// 消息格式
{
  role: 'user|assistant|system',
  content: '消息内容',
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

## 开发规范

### 代码结构
1. 所有组件均包含TODO注释，标明需要实现的功能
2. 采用单文件组件(.vue)开发模式
3. 样式使用scoped作用域，避免样式冲突
4. 组件间通过props和events进行通信

### TODO实现指南
项目中所有标记为TODO的部分需要开发者实现：

1. **数据绑定**: 实现Vue的data、computed、watch
2. **事件处理**: 实现methods中的事件处理函数
3. **API调用**: 实现与后端的数据交互
4. **本地存储**: 实现会话数据的持久化
5. **用户体验**: 实现加载状态、错误处理等

## 后端集成

此前端项目需要配合后端Flask应用使用（参考largemodel_v4）：

1. 后端应提供 `/chat` 接口处理聊天请求
2. 支持多模型和智能体配置
3. 返回标准的消息格式

## 部署说明

1. 运行 `npm run build` 构建生产版本
2. 将 `dist` 目录部署到静态文件服务器
3. 配置API代理到后端服务器
4. 确保后端服务正常运行

## 贡献指南

1. 所有功能开发基于TODO标记进行
2. 遵循Vue.js最佳实践
3. 保持代码风格一致
4. 添加适当的注释和文档

## 技术支持

如有问题，请参考Vue.js官方文档和Element UI文档。 