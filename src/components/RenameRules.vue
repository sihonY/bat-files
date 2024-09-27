<template>
  <div class="rename-rules">
    <h3>Rename</h3>
    <el-tabs v-model="activeRenameTab">
      <el-tab-pane label="Replace" name="replace">
        <el-form label-position="top">
          <el-form-item label="Replace">
            <el-input v-model="replaceFrom"></el-input>
          </el-form-item>
          <el-form-item label="To">
            <el-input v-model="replaceTo"></el-input>
          </el-form-item>
          <el-form-item label="Match Type">
            <el-radio-group v-model="matchType">
              <el-radio label="once">Replace Once</el-radio>
              <el-radio label="all">Replace All</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="Advanced" name="advanced">
        
        <el-form label-position="top">
          <el-form-item label="Advanced Rename Pattern">
            <el-input v-model="advancedPattern" placeholder="Enter pattern like: prefix{{name}}suffix-{{num}}"></el-input>
          </el-form-item>
          <div class="divider"></div>
          <el-form-item label="Test Filename">
            <el-input v-model="advancedTestFilename" placeholder="Enter a filename to test"></el-input>
          </el-form-item>
          <el-form-item label="Result">
            <el-input v-model="advancedTestResult" readonly></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="Regular Expressions" name="regex">
        <!-- 添加提示信息 -->
        <el-alert
          v-if="activeRenameTab === 'regex'"
          title="The PowerShell script will be generated in regex mode"
          type="info"
          show-icon
        ></el-alert>
        <el-form label-position="top">
          <el-form-item label="Regex">
            <el-input v-model="regex" placeholder="Enter regex like: abc([a-z]+)-(\d)\.((jpg)|(png))"></el-input>
          </el-form-item>
          <el-form-item label="New Name">
            <el-input v-model="newName" placeholder="Enter new name like: fixedpart1{{$1}}fixedpart2{{$2}}.{{$3}}"></el-input>
          </el-form-item>
          <div class="divider"></div>
          <el-form-item label="Test Filename">
            <el-input v-model="regexTestFilename" placeholder="Enter a filename to test"></el-input>
          </el-form-item>
          <el-form-item label="After Rename">
            <el-input v-model="regexTestResult" readonly></el-input>
          </el-form-item>
        </el-form>
        
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';

const activeRenameTab = ref('replace');

// Replace mode variables (unchanged)
const replaceFrom = ref('');
const replaceTo = ref('');
const matchType = ref('once');

// Advanced mode variables
const advancedPattern = ref('prefix-{{name}}-suffix-{{num}}');
const advancedTestFilename = ref('example.txt');
const advancedTestResult = ref('prefix-example-suffix-{{num}}');

// Regex mode variables
const regex = ref('');
const newName = ref('');
const regexTestFilename = ref('');
const regexTestResult = ref('');

const emit = defineEmits(['update']);
const isValid = computed(() => {
  return validateInput();
});

// Advanced mode watch function
watch([advancedPattern, advancedTestFilename], ([newPattern, newTestFilename]) => {
  advancedTestResult.value = applyAdvancedPattern(newPattern, newTestFilename);
});

// Regex mode watch function
watch([regex, newName, regexTestFilename], ([newRegex, newNewName, newTestFilename]) => {
  regexTestResult.value = applyRegexPattern(newRegex, newNewName, newTestFilename);
});

watch([activeRenameTab, replaceFrom, replaceTo, matchType, advancedPattern, regex, newName], () => {
  emit('update', {
    isValid: isValid.value,
    activeRenameTab: activeRenameTab.value,
    replaceFrom: replaceFrom.value,
    replaceTo: replaceTo.value,
    matchType: matchType.value,
    advancedPattern: advancedPattern.value,
    advancedTestFilename: advancedTestFilename.value,
    regex: regex.value,
    newName: newName.value
  });
});

onMounted(() => {
  emit('update', {
    isValid: isValid.value,
    activeRenameTab: activeRenameTab.value,
    replaceFrom: replaceFrom.value,
    replaceTo: replaceTo.value,
    matchType: matchType.value,
    advancedPattern: advancedPattern.value,
  });
});

const validateInput = () => {
  if (activeRenameTab.value === 'replace') {
    return replaceFrom.value.trim() !== '' && replaceTo.value.trim() !== '';
  } else if (activeRenameTab.value === 'advanced') {
    return advancedPattern.value.includes('{{name}}') || advancedPattern.value.includes('{{num}}');
  } else if (activeRenameTab.value === 'regex') {
    const regexValid = regex.value.trim() !== '';
    const newNameValid = /\{\$\d+\}/.test(newName.value);
    return regexValid && newNameValid;
  }
  return false;
};

function applyAdvancedPattern(pattern, filename) {
  if (!pattern || !filename) return '';

  const nameMatch = pattern.match(/{{name}}/);
  const numMatch = pattern.match(/{{num}}/);
  const extensionMatch = pattern.match(/\.\*+$/);

  let result = pattern;
  const originalExtension = filename.match(/\.[^/.]+$/);

  if (nameMatch) {
    const name = filename.replace(/\.[^/.]+$/, ""); // 移除扩展名
    result = result.replace('{{name}}', name);
  }

  if (numMatch) {
    result = result.replace(/{{num}}/, '1'); // 假设 1 为起始数字
  }

  if (extensionMatch) {
    // 如果模式中指定了 .***，则保留原文件的扩展名
    result = result.replace(/\.\*+$/, originalExtension ? originalExtension[0] : '');
  } else {
    // 如果模式中指定了具体的扩展名，则使用指定的扩展名
    const specifiedExtension = result.match(/\.[^}.]+$/);
    if (!specifiedExtension && originalExtension) {
      // 如果模式中没有指定扩展名，且原文件有扩展名，则保留原扩展名
      result += originalExtension[0];
    }
  }

  return result;
}

function applyRegexPattern(regex, newName, filename) {
  if (!regex || !newName || !filename) return '';

  try {
    const re = new RegExp(regex);
    const matches = filename.match(re);

    if (!matches) return 'No match';

    let result = newName;
    for (let i = 1; i < matches.length; i++) {
      result = result.replace(new RegExp(`\\{\\{\\$${i}\\}\\}`, 'g'), matches[i] || '');
    }

    // 处理 {{n}} 形式的占位符
    result = result.replace(/\{\{(\d+)\}\}/g, (match, p1) => {
      const index = parseInt(p1);
      return matches[index] || match;
    });

    return result;
  } catch (e) {
    return 'Invalid regex: ' + e.message;
  }
}

function logState() {
  if (activeRenameTab.value === 'replace') {
    console.log("replaceFrom:" + replaceFrom.value);
    console.log("replaceTo:" + replaceTo.value);
    console.log("matchType:" + matchType.value);
  } else if (activeRenameTab.value === 'advanced') {
    console.log("advancedPattern:" + advancedPattern.value);
    console.log("advancedTestFilename:" + advancedTestFilename.value);
  } else if (activeRenameTab.value === 'regex') {
    console.log("regex:" + regex.value);
  }
}
</script>

<style scoped>
.rename-rules {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 15px;
}

.divider {
  border-top: 1px solid #dcdfe6;
  margin: 20px 0;
}

.el-alert {
  margin-bottom: 15px;
}
</style>