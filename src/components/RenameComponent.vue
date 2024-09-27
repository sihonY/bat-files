<template>
    <el-row :gutter="20">
        <el-col :span="12">
            <el-card class="equal-height-card">
                <directory-selector @update="updateDirectoryScope" />
                <file-filter @update="updateFileFilter" />
                <rename-rules @update="updateRenameRules" />
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card class="equal-height-card">
                <code-generator ref="codeGenerator" v-bind:renameCodeParams="renameCodeParams" />
            </el-card>

        </el-col>
    </el-row>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import DirectorySelector from './DirectorySelector.vue';
import FileFilter from './FileFilter.vue';
import RenameRules from './RenameRules.vue';
import CodeGenerator from './CodeGenerator.vue';


const directoryScope = ref(null);
const fileFilter = ref(null);
const renameRules = ref(null);

const isConfigValid = computed(() => {

    return directoryScope.value && fileFilter.value && renameRules.value
        ? directoryScope.value.isValid && fileFilter.value.isValid && renameRules.value.isValid
        : false;

});

const renameCodeParams = computed(() => {
    // debugger;
    return {
        directoryScope: directoryScope.value || null,
        fileFilter: fileFilter.value || null,
        renameRules: renameRules.value || null,
        isConfigValid: isConfigValid.value
    };

});


function updateDirectoryScope(newDirectoryScope) {
    directoryScope.value = newDirectoryScope;
}

function updateFileFilter(newFileFilter) {
    fileFilter.value = newFileFilter;
}

function updateRenameRules(newRenameRules) {
    renameRules.value = newRenameRules;
}

</script>

<style scoped>
.el-row {
    margin-bottom: 20px;
}

.equal-height-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.el-card__body) {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
</style>