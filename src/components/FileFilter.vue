<template>
  <div class="file-filter">
    <h3>File Filter</h3>
    <el-select v-model="filterType" placeholder="Select filter type" class="filter-type-select">
      <el-option label="By name" value="name"></el-option>
    </el-select>
    <el-select v-model="matchType" placeholder="Select match type" class="match-type-select">
      <el-option label="Include" value="include"></el-option>
      <el-option label="Exclude" value="exclude"></el-option>
      <el-option label="Match" value="match"></el-option>
    </el-select>
    <el-input
      v-if="matchType !== 'match'"
      v-model="plainTextFilter"
      placeholder="Empty value will match all files/directories, including .bat files"
      class="filter-input"
    ></el-input>
    <el-input
      v-else
      v-model="regexFilter"
      placeholder="*.jpg,*keyword,filename"
      class="filter-input"
    ></el-input>
  </div>
</template>

<script setup>
import { ref, computed,watch,onMounted } from 'vue';

const filterType = ref('name');
const matchType = ref('include');
const plainTextFilter = ref('');
const regexFilter = ref('');

const emit = defineEmits(['update']);

const filterValue = computed(() => {
  return matchType.value === 'match' ? regexFilter.value : plainTextFilter.value;
});

const isValid = computed(() => {
  //当matchType为match时，正则表达式不能为空，其它情况均有效
  return matchType.value === 'match' ? regexFilter.value.trim() !== "" : true;
});


watch([filterValue,filterType,matchType],() => {
  emit('update', {
    filterType: filterType.value,
    matchType: matchType.value,
    filterValue: filterValue,
    isValid: isValid.value
  });
  // logState();
});

onMounted(() => {
  emit('update', {
    filterType: filterType.value,
    matchType: matchType.value,
    filterValue: filterValue,
    isValid: isValid.value
  });

});

function updateFileFilter(newFileFilter) {
    fileFilter.value = newFileFilter;
}

function logState(){
  console.log("filterType:"+filterType.value)
  console.log("matchType:"+matchType.value)
  console.log("filterValue:"+filterValue.value)
}
</script>

<style scoped>
.file-filter {
  margin-bottom: 20px;
}

.filter-type-select,
.match-type-select {
  width: 100%;
  margin-bottom: 10px;
}

.filter-input {
  margin-top: 10px;
}
</style>