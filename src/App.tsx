import React, { useState, useEffect } from "react";
import { HitokotoData } from "./types";

function App() {
  const [hitokoto, setHitokoto] = useState<HitokotoData | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取一言数据
  const fetchHitokoto = async () => {
    setLoading(true);
    try {
      // 获取插件设置
      const settings = logseq.settings;
      const sentenceType = (settings?.sentenceType as string) || "";
      const minLength = (settings?.minLength as number) || 0;
      const maxLength = (settings?.maxLength as number) || 30;
      // 构建 API URL
      let apiUrl = "https://v1.hitokoto.cn/";
      const params: string[] = [];
      // 处理句子类型（支持多选）
      if (sentenceType && sentenceType.trim()) {
        const types = sentenceType
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);  
        types.forEach((type) => {params.push(`c=${type}`)});
      }
      if (minLength > 0) {
        params.push(`min_length=${minLength}`);
      }
      if (maxLength > 0) {
        params.push(`max_length=${maxLength}`);
      }
      if (params.length > 0) {
        apiUrl += "?" + params.join("&");
      }
      const response = await fetch(apiUrl);
      const data: HitokotoData = await response.json();
      setHitokoto(data);
    } catch (error) {
      console.error("获取一言失败:", error);
      logseq.UI.showMsg("获取一言失败，请检查网络连接", "error");
    } finally {
      setLoading(false);
    }
  };

  // 初始加载（仅在组件挂载时执行一次）
  useEffect(() => {
    fetchHitokoto();
  }, []);

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!hitokoto) return;
    const text = hitokoto.from_who
      ? `${hitokoto.hitokoto} —— ${hitokoto.from_who}「${hitokoto.from}」`
      : `${hitokoto.hitokoto} —— 「${hitokoto.from}」`;
    try {
      await parent.navigator.clipboard.writeText(text);
      logseq.UI.showMsg("已复制到剪贴板", "success");
    } catch (error) {
      console.error("复制失败:", error);
      logseq.UI.showMsg("复制失败，请手动选择文本复制", "error");
    }
  };

  // 搜索跳转
  const handleSearch = () => {
    if (!hitokoto) return;
    const searchQuery = encodeURIComponent(hitokoto.hitokoto);
    window.open(`https://www.bing.com/search?q=${searchQuery}`, "_blank");
  };

  if (!hitokoto) {
    return (
      <div className="hitokoto-container">
        <div className="hitokoto-content">
          <span className="hitokoto-text">加载中...</span>
        </div>
      </div>
    );
  }

  // 处理右键点击
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    fetchHitokoto();
  };

  return (
    <div className="hitokoto-container">
      <div className="hitokoto-wrapper">
        <div 
          className="hitokoto-content"
          onClick={handleCopy}
          onContextMenu={handleContextMenu}
          style={{ cursor: 'pointer' }}
          title="左键复制，右键切换"
        >
          <span className="hitokoto-text">
            {hitokoto.hitokoto}
          </span>
          <span className="hitokoto-source">
            {hitokoto.from_who ? `—— ${hitokoto.from_who}` : "——"} 「{hitokoto.from}」
          </span>
        </div>

        <div className="hitokoto-actions">
          <button
            className="hitokoto-btn"
            onClick={handleCopy}
            title="复制"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          
          <button
            className="hitokoto-btn"
            onClick={fetchHitokoto}
            disabled={loading}
            title="切换"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
          
          <button
            className="hitokoto-btn"
            onClick={handleSearch}
            title="搜索"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
