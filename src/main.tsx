import "@logseq/libs";

import App from "./App";
import React from "react";
import * as ReactDOM from "react-dom/client";

import { logseq as PL } from "../package.json";

const css = String.raw;

const pluginId = PL.id;

function main() {
  console.info(`#${pluginId}: MAIN`);

  // 注册插件设置
  logseq.useSettingsSchema([
    {
      key: "sentenceType",
      type: "string",
      title: "句子类型",
      description: "输入句子的类型，多个类型用逗号隔开。（ a,b,c,d,e,f,g,h,i,j,k,l 分别表示动画，漫画，游戏，文学，原创，来自网络，其他，影视，诗词，网易云，哲学，抖机灵。留空表示全部。）",
      default: "a, c, d, h, i, k",
    },
    {
      key: "minLength",
      type: "number",
      title: "最短句子长度",
      description: "设置句子的最小字符数",
      default: 0,
    },
    {
      key: "maxLength",
      type: "number",
      title: "最长句子长度",
      description: "设置句子的最大字符数",
      default: 30,
    },
  ]);

  // 创建插件容器
  logseq.provideUI({
    key: "hitokoto-main",
    path: "body",
    template: `<div id="hitokoto-app"></div>`,
  });

  // 动态调整横幅位置
  const updatePosition = () => {
    const container = parent.document.getElementById("hitokoto-app");
    if (!container) return;

    let leftMargin = 42; // 默认左边距（如果没有侧边栏）
    let rightMargin = 42; // 默认右边距（如果没有图标）

    const windowWidth = parent.window.innerWidth;

    // 查找左侧边栏
    const sidebar = parent.document.querySelector("#left-sidebar");
    // 计算左边距：侧边栏右边缘位置 + 42px
    if (sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      leftMargin = sidebarRect.right + 42;
    }

    // 查找右上角所有可见的图标按钮
    const headerContainer = parent.document.querySelector("#head");
    if (headerContainer) {
      // 查找所有可能的图标按钮，但排除下拉菜单中的元素
      const iconButtons = headerContainer.querySelectorAll("button, a.button, .toolbar-button, [class*='icon'], [class*='btn']");
      
      let leftmostIconX = windowWidth; // 初始化为窗口最右边
      
      // 遍历所有图标，找到最左边（x坐标最小）的那个
      iconButtons.forEach((icon) => {
        // 检查元素是否在下拉菜单中（通过检查父元素是否有 dropdown、menu、popover 等类名）
        let isInDropdown = false;
        let parentEl = icon.parentElement;

        while (parentEl && parentEl !== headerContainer) {
          const classList = parentEl.className || '';
          if (typeof classList === 'string' && 
              (classList.includes('dropdown') || 
               classList.includes('menu') || 
               classList.includes('popover') ||
               classList.includes('panel') ||
               parentEl.getAttribute('role') === 'menu')) {
            isInDropdown = true;
            break;
          }
          parentEl = parentEl.parentElement;
        }

        // 跳过下拉菜单中的元素
        if (isInDropdown) return;
        // 只考虑可见的、在右半部分的图标
        const rect = icon.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.left > windowWidth / 2) {
          if (rect.left < leftmostIconX) {
            leftmostIconX = rect.left;
          }
        }
      });

      // 如果找到了图标，计算右边距：窗口宽度 - 最左图标的左边缘 + 42px
      if (leftmostIconX < windowWidth) {
        rightMargin = windowWidth - leftmostIconX + 42;
      }
    }

    container.style.left = `${leftMargin}px`;
    container.style.right = `${rightMargin}px`;
  };

  // 等待 DOM 元素创建后再渲染 React
  const initializeApp = (retryCount = 0) => {
    const MAX_RETRIES = 10; // 最多重试 10 次
    const RETRY_INTERVAL = 100; // 每次间隔 100ms
    const container = parent.document.getElementById("hitokoto-app");

    if (!container) {
      if (retryCount >= MAX_RETRIES) {
        console.error(`初始化失败：在 ${MAX_RETRIES} 次重试后仍未找到容器元素`);
        logseq.UI.showMsg("Hitokoto 插件初始化失败", "error");
        return;
      }
      setTimeout(() => initializeApp(retryCount + 1), RETRY_INTERVAL);
      return;
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 初始化位置
    updatePosition();

    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    // 监听侧边栏变化
    const sidebar = parent.document.querySelector("#left-sidebar");
    if (sidebar) {
      resizeObserver.observe(sidebar);
    }

    // 监听窗口大小变化
    const resizeHandler = () => updatePosition();
    parent.window.addEventListener("resize", resizeHandler);

    // 使用 MutationObserver 监听头部区域的 DOM 变化（图标增删）
    const mutationObserver = new MutationObserver(() => {
      updatePosition();
    });

    const head = parent.document.querySelector("#head");
    if (head) {
      mutationObserver.observe(head, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // 清理函数：当插件卸载时清理所有监听器
    logseq.beforeunload(async () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      parent.window.removeEventListener("resize", resizeHandler);
    });
  };

  initializeApp();

  // 提供样式
  logseq.provideStyle(css`
    #hitokoto-app {
      position: fixed;
      top: 0;
      left: 220px;
      right: 200px;
      height: 48px;
      z-index: 999;
      pointer-events: none;
      box-sizing: border-box;
      transition: left 0.3s ease, right 0.3s ease;
      display: flex;
      align-items: center;
      padding-top: 4px;
    }

    .hitokoto-container {
      background: transparent;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: auto;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .hitokoto-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 100%;
      overflow: hidden;
    }

    .hitokoto-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--ls-primary-text-color);
      opacity: 0.75;
      flex-shrink: 1;
      min-width: 0;
      overflow: hidden;
    }

    .hitokoto-text {
      font-size: 0.9rem;
      font-weight: 400;
      line-height: 1.5;
      white-space: nowrap;
      flex-shrink: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hitokoto-source {
      font-size: 0.8rem;
      opacity: 0.8;
      font-style: italic;
      white-space: nowrap;
      flex-shrink: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hitokoto-actions {
      display: flex;
      gap: 0.25rem;
      flex-shrink: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      pointer-events: none;
    }

    .hitokoto-container:hover .hitokoto-actions {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .hitokoto-btn {
      background: transparent;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
      color: var(--ls-primary-text-color);
      opacity: 0.6;
    }

    .hitokoto-btn:hover:not(:disabled) {
      opacity: 1;
      background: var(--ls-quaternary-background-color);
    }

    .hitokoto-btn:active:not(:disabled) {
      opacity: 0.8;
    }

    .hitokoto-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  `);
}

logseq.ready(main).catch(console.error);
