<template>
  <div class="code-generator">
    <el-tabs v-model="activeOSTab">
      <el-tab-pane label="Windows" name="windows">
        <el-input type="textarea" :rows="20" v-model="windowsCode" readonly></el-input>
      </el-tab-pane>
      <el-tab-pane label="MacOS" name="macos"  v-if="false">
        <el-input type="textarea" :rows="20" v-model="macosCode" readonly></el-input>
      </el-tab-pane>
    </el-tabs>
    <el-checkbox v-model="confirmBeforeExecution" v-if="false">Confirm before execution</el-checkbox>
    <!-- <el-button type="primary" @click="copyToClipboard">复制代码</el-button> -->
    <el-button type="primary" @click="downloadFile" class="download-button">Download file</el-button>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { generateBatch, generatePowerShell, generateShell } from './generateScripts';

const activeOSTab = ref('windows');
const windowsCode = ref('# Windows batch code will be generated here');
const macosCode = ref('# MacOS shell script will be generated here');
const confirmBeforeExecution = ref(true);

const props = defineProps({
  renameCodeParams: {
    type: Object,
    // required: true,
  },
});
const renameCodeParams = computed(() => {
  return props.renameCodeParams;
});


watch([activeOSTab, renameCodeParams], () => {

  // debugger;
  if (renameCodeParams.value.isConfigValid) {
    const code = generateMethod.value(props.renameCodeParams);
    if (activeOSTab.value === 'windows') {
      windowsCode.value = code;
    } else {
      macosCode.value = code;
    }
  }else{
    windowsCode.value = '# Windows batch code will be generated here';
    macosCode.value = '# MacOS shell script will be generated here';
  }

}, { deep: true });



const downloadFile = () => {
  const code = activeOSTab.value === 'windows' ? windowsCode.value : macosCode.value;
  const filename = activeOSTab.value === 'windows' ? 'rename_script.bat' : 'rename_script.sh';
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const generateMethod = computed(() => {
  // debugger;
  if (activeOSTab.value === 'windows') {
    if (props.renameCodeParams.renameRules.activeRenameTab === 'regex') {
      return generatePowerShell;
    } else {
      return generateBatch;
    }
  } else {
    return generateShell;
  }
});


</script>

<style scoped>
.code-generator {
  display: flex;
  flex-direction: column;
  margin-top: 50px;
  height: 100%;
}
.code-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
}

.code-actions .el-button {
  margin-top: 10px;
  margin-left: 10px;
}

.code-container {
  margin-bottom: 20px;
}

/* 新增样式 */
.download-button {
  margin-top: 20px; /* 调整间距 */
}
</style>