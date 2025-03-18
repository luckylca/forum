const GITHUB_REPO = 'luckylca/forum';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

async function fetchPosts() {
    try {
        const response = await fetch(GITHUB_API);
        const issues = await response.json();
        
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // 清除加载提示
        
        issues.forEach(issue => {
            const postElement = createPostElement(issue);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('获取帖子失败:', error);
        document.getElementById('posts-container').innerHTML = 
            '<div class="error">加载失败，请稍后重试</div>';
    }
}

function createPostElement(issue) {
    const post = document.createElement('article');
    post.className = 'post';
    
    const date = new Date(issue.created_at).toLocaleDateString('zh-CN');
    
    post.innerHTML = `
        <div class="post-header">
            <img src="${issue.user.avatar_url}" alt="${issue.user.login}">
            <div>
                <h3>${issue.title}</h3>
                <small>由 ${issue.user.login} 发布于 ${date}</small>
            </div>
        </div>
        <div class="post-content">
            ${marked.parse(issue.body)}
        </div>
        <a href="${issue.html_url}" target="_blank">查看讨论</a>
    `;
    
    return post;
}

// 页面加载时获取帖子
document.addEventListener('DOMContentLoaded', fetchPosts); 