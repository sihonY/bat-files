<template>
    <div class="feedback-section">
        <div class="feedback-row">
            <el-button type="primary" @click="handleLike" :disabled="liked" class="like-button">
                <svg-icon :path="liked ? mdiHeart : mdiHeartOutline" class="heart-icon" viewBox="0 0 24 24" :size="15" />
                {{ liked ? 'Liked' : 'Like' }}
            </el-button>
            <span class="separator">|</span>
            
            <div class="feedback-text">
                <p>For any suggestions or bugs, please email to:</p>
                <a :href="`mailto:${email}`">{{ email }}</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiHeart, mdiHeartOutline } from '@mdi/js';

const email = 'jgyuanxh@gmail.com';
const liked = ref(false);

// 检查本地存储
onMounted(() => {
    const likedStatus = localStorage.getItem('liked');
    liked.value = likedStatus === 'true';
});

// 处理 Like 点击事件
const handleLike = () => {
    if (!liked.value) {
        // 触发 Google Analytics 自定义事件
        window.gtag('event', 'like', {
            event_category: 'engagement',
            event_label: 'like_button',
            value: 1,
        });

        // 更新本地存储
        localStorage.setItem('liked', 'true');
        liked.value = true;
    }
};
</script>

<script>
export default {
    name: "FeedbackSection",
    components: {
        SvgIcon
    }
}
</script>

<style scoped>
.feedback-section {
    margin-top: 20px;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feedback-row {
    display: flex;
    align-items: center;
    justify-content: center;
}

.feedback-section .el-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #6a11cb; /* 主按钮颜色 */
    border-color: #6a11cb;
}

.feedback-section .el-button:disabled {
    background-color: #764ca3; /* 紫色搭配的禁用背景色 */
    border-color: #d3a4ff;
    color: white;
}

.feedback-section .heart-icon {
    margin-right: 5px;
}

.separator {
    margin: 0 10px;
    color: #6a11cb;
}

.feedback-text {
    font-size: 0.8em;
    color: #333;
    text-align: left;
}

.feedback-text p {
    margin: 0;
}

.feedback-text a {
    color: #6a11cb;
    text-decoration: none;
}

.feedback-text a:hover {
    text-decoration: underline;
}
</style>