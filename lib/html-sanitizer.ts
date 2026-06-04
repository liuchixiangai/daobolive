/**
 * HTML 安全处理
 * - 移除 script 标签
 * - 移除 javascript: 伪协议
 * - 移除 on* 事件属性
 * - 只允许白名单 iframe 域名
 */

const IFRAME_WHITELIST = [
  "vzan.com",           // 微赞
  "bilibili.com",       // B站
  "qq.com",             // 腾讯视频
  "polyv.net",          // 保利威
  "polyvcdn.net",       // 保利威 CDN
];

// 危险标签
const DANGEROUS_TAGS = ["script", "embed", "object", "applet"];

// 危险属性（on* 事件）
const EVENT_ATTR_REGEX = /^on\w+/i;

export interface SanitizeResult {
  html: string;
  hasIframe: boolean;
  iframeBlocked: boolean;
}

/**
 * 基础 HTML 清洗
 */
export function sanitizeHtml(raw: string): SanitizeResult {
  let html = raw;
  let iframeBlocked = false;
  let hasIframe = false;

  // 1. 移除危险标签（script 等）
  DANGEROUS_TAGS.forEach((tag) => {
    const regex = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi");
    html = html.replace(regex, "");
    // 自闭合
    const selfClose = new RegExp(`<${tag}[^>]*\\/>`, "gi");
    html = html.replace(selfClose, "");
  });

  // 2. 移除 javascript: 伪协议
  html = html.replace(/javascript\s*:/gi, "");

  // 3. 处理 iframe
  hasIframe = /<iframe[\s>]/i.test(raw);

  html = html.replace(/<iframe([\s\S]*?)<\/iframe>/gi, (match, attrs) => {
    // 提取 src
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    if (!srcMatch) {
      iframeBlocked = true;
      return `<div class="iframe-blocked">${match
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</div>`;
    }

    const src = srcMatch[1];
    try {
      const host = new URL(src).hostname.toLowerCase();
      const allowed = IFRAME_WHITELIST.some((d) =>
        host === d || host.endsWith("." + d)
      );

      if (allowed) {
        return match;
      }

      iframeBlocked = true;
      return `<div class="iframe-blocked">该播放器可能限制嵌入，请检查第三方平台 iframe 地址。</div>`;
    } catch {
      iframeBlocked = true;
      return `<div class="iframe-blocked">该播放器可能限制嵌入，请检查第三方平台 iframe 地址。</div>`;
    }
  });

  // 4. 移除 on* 事件属性
  html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");

  return { html, hasIframe, iframeBlocked };
}

/**
 * 安全展示 HTML（用于预览和公开页）
 * 额外添加 iframe-blocked 样式提示
 */
export function wrapHtmlForDisplay(html: string): string {
  const style = `
    <style>
      .iframe-blocked {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 16px;
        color: #92400e;
        font-size: 14px;
        text-align: center;
      }
      body { margin: 0; }
    </style>
  `;
  return style + html;
}
