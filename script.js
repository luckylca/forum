const GITHUB_REPO = 'luckylca/forum';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

async function fetchPosts() {
    try {
        const response = await fetch(GITHUB_API);
        const issues = await response.json();
        
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // 清除加载提示
        
        if (!Array.isArray(issues) || issues.length === 0) {
            postsContainer.innerHTML = '<div class="post">还没有帖子，快来发布第一个帖子吧！</div>';
            return;
        }
        
        issues.forEach(issue => {
            const postElement = createPostElement(issue);
            postsContainer.appendChild(postElement);
        });
        
        // 添加动画效果
        const elems = document.querySelectorAll('.post');
        M.Tooltip.init(elems);
    } catch (error) {
        console.error('获取帖子失败:', error);
        document.getElementById('posts-container').innerHTML = 
            '<div class="error">加载失败，请稍后重试<br>错误信息: ' + error.message + '</div>';
    }
}

function createPostElement(issue) {
    const post = document.createElement('article');
    post.className = 'post';
    
    const date = new Date(issue.created_at).toLocaleDateString('zh-CN');
    
    // 安全处理 issue.body，如果为空则显示默认文本
    const content = issue.body ? marked.parse(issue.body) : '（无内容）';
    
    post.innerHTML = `
        <div class="post-header">
            <img src="${issue.user.avatar_url}" alt="${issue.user.login}">
            <div>
                <h3>${issue.title}</h3>
                <small>由 ${issue.user.login} 发布于 ${date}</small>
            </div>
        </div>
        <div class="post-content">
            ${content}
        </div>
        <button class="btn view-discussion" onclick="showComments('${issue.number}')">查看讨论</button>
        <div id="comments-${issue.number}" class="comments" style="display: none;"></div>
    `;
    
    return post;
}

async function showComments(issueNumber) {
    const commentsContainer = document.getElementById(`comments-${issueNumber}`);
    
    if (commentsContainer.style.display === 'block') {
        commentsContainer.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${GITHUB_API}/${issueNumber}/comments`);
        const comments = await response.json();
        
        commentsContainer.innerHTML = ''; // 清空之前的评论
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <strong>${comment.user.login}</strong>:
                <p>${comment.body}</p>
            `;
            commentsContainer.appendChild(commentElement);
        });
        
        commentsContainer.style.display = 'block'; // 显示评论
    } catch (error) {
        console.error('获取评论失败:', error);
        commentsContainer.innerHTML = '<div class="error">加载评论失败，请稍后重试</div>';
    }
}

// 添加自动刷新功能
function setupAutoRefresh() {
    // 每30秒刷新一次
    setInterval(fetchPosts, 30000);
}

// 页面加载时获取帖子并设置自动刷新
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    setupAutoRefresh();
}); 