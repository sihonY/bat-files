<template>
  <div class="directory-selector">
    <h3>Operation Scope</h3>
    <el-radio-group v-model="scope" class="scope-radio-group">
      <el-radio label="current">Current Directory （based on file location）</el-radio>
      <el-radio label="custom">Custom Path</el-radio>
    </el-radio-group>
    
    <el-input
      v-if="scope === 'custom'"
      v-model="customPath"
      placeholder="Enter custom path"
      class="custom-path-input"
      @input="checkSensitivePath"
    ></el-input>
    <el-alert
      v-if="showWarning"
      title="Warning: Sensitive System Path Detected"
      type="warning"
      description="The path you entered may be a sensitive system directory. Please be cautious when operating on this path."
      show-icon
      :closable="false"
      class="warning-alert"
    ></el-alert>

    <div class="include-subdirectories">
      <el-checkbox v-model="includeSubdirectories">Include Subdirectories</el-checkbox>
    </div>
    <h3>Rename Target</h3>
    <el-radio-group v-model="renameTarget" class="rename-target-radio-group">
      <el-radio label="file">File</el-radio>
      <el-radio label="directory" :disabled="includeSubdirectories">Directory</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import {onMounted, ref, watch } from 'vue';

const scope = ref('current');
const customPath = ref('');
const includeSubdirectories = ref(false);
const showWarning = ref(false);
const renameTarget = ref('file'); // 新增的重命名目标
const emit = defineEmits(['update']);

const sensitivePaths = [
  '/System', '/Library', '/Users', '/Volumes', '/Applications', '/bin', '/etc', '/var', '/tmp',
  'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\Users', 'C:\\ProgramData'
];


watch([scope, customPath, includeSubdirectories,renameTarget], () => {

  if(includeSubdirectories.value && renameTarget.value === 'directory'){
    renameTarget.value = 'file';
  }
  emit('update', {
    scope: scope.value,
    customPath: customPath.value,
    includeSubdirectories: includeSubdirectories.value,
    renameTarget: renameTarget.value,
    isValid: validateInput()
    
  });
  // logState();
});

onMounted(() => {
  emit('update', {
    scope: scope.value,
    customPath: scope.value === 'custom' ? customPath.value : "./",
    includeSubdirectories: includeSubdirectories.value,
    renameTarget: renameTarget.value,
    isValid: validateInput()
    
  }); // 发送初始值
});

function logState(){
  console.log("scope change:"+scope.value)
  if(scope.value === 'custom'){
    console.log("custom path:"+customPath.value)
  }
  console.log("include subdirectories:"+includeSubdirectories.value)
  console.log("validateInput:"+validateInput())
}

const validateInput = () => {
  if (scope.value === 'custom') {
    return customPath.value.trim() !== '' ;//&& !showWarning.value;
  }
  return true;
};

const checkSensitivePath = () => {
  const path = customPath.value.trim().toLowerCase();
  if (scope.value === 'custom') {
    const path = customPath.value.trim().toLowerCase();
    showWarning.value = sensitivePaths.some(sensitivePath => 
      path === sensitivePath.toLowerCase() || path.startsWith(sensitivePath.toLowerCase() + '/')
    );
  } else {
    showWarning.value = false;
  }
};
</script>

<style scoped>
.directory-selector {
  margin-bottom: 20px;
}

.scope-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.custom-path-input {
  margin-top: 10px;
}

.include-subdirectories {
  margin-top: 15px;
}
.warning-alert {
  margin-top: 10px;
}
</style>