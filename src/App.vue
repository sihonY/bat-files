<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1>Bat File</h1>
        <h2>Batch Rename Your Files Easily</h2>
      </div>
    </header>
    <main class="app-main">
      <el-steps :active="0" finish-status="wait" class="steps-container" responsive v-show="false">
        <el-step title="Step One" description="Setup your Command" />
        <el-step title="Step Two" description="Download your .bat file" />
        <el-step title="Step Three" description="Run it on any Computer!" />
      </el-steps>
      
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="Rename" name="rename">
          <rename-component />
        </el-tab-pane>
        <el-tab-pane label="Move/Copy" name="movecopy" v-if="false">
          Move/Copy Component (Not implemented)
        </el-tab-pane>
        <el-tab-pane label="Delete" name="delete" v-if="false">
          Delete Component (Not implemented)
        </el-tab-pane>
      </el-tabs>
    </main>
    <!-- <Analytics/> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RenameComponent from './components/RenameComponent.vue';
import { inject } from "@vercel/analytics"
const activeTab = ref('rename');

inject();

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

@import "element-plus/dist/index.css";

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  color: #333;
  font-family: 'Poppins', sans-serif;
}

.app-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.app-header {
  padding: 40px 0;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  text-align: center;
  color: white;
}

h1 {
  font-size: 3.5em;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

h2 {
  font-size: 1.5em;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0;
  letter-spacing: 1px;
}

.app-main {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.steps-container {
  margin: 30px 0;
}

.steps-container :deep(.el-step) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.steps-container :deep(.el-step__head) {
  margin-right: 0;
}

.steps-container :deep(.el-step__main) {
  text-align: center;
  padding-top: 10px;
}

.steps-container :deep(.el-step__title) {
  font-size: 16px;
  line-height: 24px;
}

.steps-container :deep(.el-step__description) {
  font-size: 14px;
  padding-top: 5px;
}

.steps-container :deep(.el-step__line) {
  top: 15px;
  left: 50%;
  right: -50%;
}

.steps-container :deep(.el-step:last-child .el-step__line) {
  display: none;
}

.steps-container :deep(.el-step__head.is-process) {
  color: #6a11cb;
  border-color: #6a11cb;
}

.steps-container :deep(.el-step__title.is-process) {
  color: #6a11cb;
}

.steps-container :deep(.el-step__description.is-process) {
  color: #764ba2;
}

.el-tabs__item {
  color: #4a4a4a;
}

.el-tabs__item.is-active {
  color: #6a11cb;
}

.el-tabs__active-bar {
  background-color: #6a11cb;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.el-card__header {
  background-color: #f0f2f5;
  border-bottom: 1px solid #e8e8e8;
}

.el-button--primary {
  background-color: #6a11cb;
  border-color: #6a11cb;
}

.el-button--primary:hover,
.el-button--primary:focus {
  background-color: #7c3aed;
  border-color: #7c3aed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-content h1, .header-content h2 {
  animation: fadeIn 1s ease-out;
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: #7c3aed; /* 自定义选中背景色 */
  border-color: #7c3aed; /* 自定义选中边框色 */
}

.el-radio__input.is-checked + .el-radio__label {
  color: #7c3aed; /* 自定义选中文本颜色 */
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #7c3aed; /* 自定义选中背景色 */
  border-color: #7c3aed; /* 自定义选中边框色 */
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #7c3aed; /* 自定义选中文本颜色 */
}
</style>
