<template>
  <div class="preview-container">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="toolbar-left">
        <h1 class="title">Lumiflora FSDK Preview</h1>
      </div>
      <div class="toolbar-center">
        <div class="template-switch">
          <span class="label">Template:</span>
          <button 
            v-for="t in templateTypes" 
            :key="t"
            :class="['switch-btn', { active: currentTemplate === t }]"
            @click="switchTemplate(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="refresh-btn" @click="refreshPreview" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧模板列表 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Templates</h2>
        </div>
        <ul class="template-list">
          <li 
            v-for="template in templates" 
            :key="template.name"
            :class="['template-item', { active: selectedTemplate === template.name }]"
            @click="selectTemplate(template.name)"
          >
            <span class="template-icon">{{ template.icon || '📦' }}</span>
            <span class="template-name">{{ template.name }}</span>
          </li>
        </ul>
      </aside>

      <!-- 右侧预览区 -->
      <section class="preview-area">
        <div v-if="error" class="error-boundary">
          <h3>Error</h3>
          <p>{{ error.message }}</p>
          <button @click="clearError">Dismiss</button>
        </div>
        <iframe 
          v-else
          ref="previewFrame"
          :src="previewUrl" 
          class="preview-iframe"
          title="Template Preview"
          @load="onIframeLoad"
        ></iframe>
      </section>
    </main>

    <!-- 状态栏 -->
    <footer class="status-bar">
      <span class="status-item">Template: {{ currentTemplate }}</span>
      <span class="status-item">Status: {{ connectionStatus }}</span>
      <span class="status-item" v-if="lastUpdate">Last Update: {{ formatTime(lastUpdate) }}</span>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'App',
  
  setup() {
    const templates = ref([
      { name: 'full', icon: '📦' },
      { name: 'base', icon: '📁' }
    ]);
    const templateTypes = ['full', 'base'];
    const currentTemplate = ref('full');
    const selectedTemplate = ref('full');
    const previewUrl = ref('/preview/preview.html');
    const isLoading = ref(false);
    const error = ref(null);
    const connectionStatus = ref('Disconnected');
    const lastUpdate = ref(null);
    const previewFrame = ref(null);
    let eventSource = null;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      const port = window.location.port || 3000;
      eventSource = new EventSource(`http://localhost:${port}/sse`);

      eventSource.onopen = () => {
        connectionStatus.value = 'Connected';
        console.log('[SSE] Connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Received:', data);
          
          if (data.type === 'reload') {
            lastUpdate.value = data.timestamp;
            refreshPreview();
          }
        } catch (e) {
          console.log('[SSE] Raw message:', event.data);
        }
      };

      eventSource.onerror = (err) => {
        console.error('[SSE] Error:', err);
        connectionStatus.value = 'Disconnected';
        // 5秒后重连
        setTimeout(connectSSE, 5000);
      };
    };

    const switchTemplate = (type) => {
      currentTemplate.value = type;
      refreshPreview();
    };

    const selectTemplate = (name) => {
      selectedTemplate.value = name;
      currentTemplate.value = name;
      refreshPreview();
    };

    const refreshPreview = async () => {
      isLoading.value = true;
      error.value = null;
      
      try {
        // 触发模板重新加载
        const timestamp = Date.now();
        previewUrl.value = `/preview/preview.html?t=${timestamp}`;
        
        if (previewFrame.value) {
          previewFrame.value.src = previewUrl.value;
        }
      } catch (e) {
        error.value = { message: e.message };
      } finally {
        isLoading.value = false;
      }
    };

    const onIframeLoad = () => {
      console.log('[Preview] Iframe loaded');
      isLoading.value = false;
    };

    const clearError = () => {
      error.value = null;
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    onMounted(() => {
      connectSSE();
    });

    onUnmounted(() => {
      if (eventSource) {
        eventSource.close();
      }
    });

    return {
      templates,
      templateTypes,
      currentTemplate,
      selectedTemplate,
      previewUrl,
      isLoading,
      error,
      connectionStatus,
      lastUpdate,
      previewFrame,
      switchTemplate,
      selectTemplate,
      refreshPreview,
      onIframeLoad,
      clearError,
      formatTime
    };
  }
};
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-left .title {
  font-size: 18px;
  font-weight: 600;
}

.toolbar-center .template-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center .label {
  font-size: 14px;
  opacity: 0.8;
}

.switch-btn {
  padding: 6px 16px;
  border: 1px solid rgba(255,255,255,0.3);
  background: transparent;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover {
  background: rgba(255,255,255,0.1);
}

.switch-btn.active {
  background: #42b983;
  border-color: #42b983;
}

.refresh-btn {
  padding: 6px 16px;
  background: #42b983;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #359268;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.template-list {
  list-style: none;
  padding: 8px;
  overflow-y: auto;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.template-item:hover {
  background: #f5f5f5;
}

.template-item.active {
  background: #e3f2ed;
}

.template-icon {
  font-size: 20px;
}

.template-name {
  font-size: 14px;
  color: #333;
}

.preview-area {
  flex: 1;
  position: relative;
  background: #e0e0e0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.error-boundary {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
}

.error-boundary h3 {
  color: #e74c3c;
  margin-bottom: 8px;
}

.error-boundary p {
  color: #666;
  margin-bottom: 16px;
}

.error-boundary button {
  padding: 8px 16px;
  background: #3498db;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.status-bar {
  display: flex;
  gap: 20px;
  padding: 8px 20px;
  background: #34495e;
  color: #bdc3c7;
  font-size: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
