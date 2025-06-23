// 快速语言切换脚本 - 用于展览期间快速切换中英文
// 使用方法：
// 1. 在浏览器控制台中运行此脚本
// 2. 或者将此脚本保存为书签，点击即可切换语言

(function() {
  // 获取当前语言状态
  const currentLang = localStorage.getItem('language') || 'en';
  
  // 切换语言
  const newLang = currentLang === 'en' ? 'zh' : 'en';
  
  // 保存到localStorage
  localStorage.setItem('language', newLang);
  
  // 触发语言切换事件
  window.dispatchEvent(new CustomEvent('languageChange', { 
    detail: { language: newLang } 
  }));
  
  // 显示切换结果
  const message = newLang === 'zh' ? '已切换到中文' : 'Switched to English';
  console.log(message);
  
  // 可选：显示页面通知
  if (typeof window.showNotification === 'function') {
    window.showNotification(message);
  } else {
    // 简单的页面通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${newLang === 'zh' ? '#4CAF50' : '#2196F3'};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
})(); 