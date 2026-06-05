"use client";

import { useState, useEffect } from "react";
import { sanitizeHtml, wrapHtmlForDisplay } from "@/lib/html-sanitizer";
import Link from "next/link";

interface HtmlEditorProps {
  caseId: string;
  initialHtml?: string | null;
}

export default function HtmlEditor({ caseId, initialHtml }: HtmlEditorProps) {
  const [htmlCode, setHtmlCode] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"none" | "side" | "full">("none");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (initialHtml) {
      setHtmlCode(initialHtml);
    }
  }, [initialHtml]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setWarnings([]);

    try {
      const res = await fetch(`/api/admin/cases/${caseId}/html`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: htmlCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "保存失败" });
      } else {
        setMessage({ type: "success", text: "HTML 已保存" });
        // 用服务端返回的清洗后内容回填编辑器
        if (data.sanitized) {
          setHtmlCode(data.sanitized);
        }
        if (data.warnings?.length) {
          setWarnings(data.warnings);
        }
      }
    } catch {
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const sanitized = sanitizeHtml(htmlCode);

  return (
    <div className="card" style={{ marginTop: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 className="card-title" style={{ margin: 0 }}>HTML 内容</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className={`btn btn-sm ${previewMode === "side" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setPreviewMode(previewMode === "side" ? "none" : "side")}
          >
            {previewMode === "side" ? "关闭预览" : "侧边预览"}
          </button>
          <Link
            href={`/admin/cases/${caseId}/preview`}
            className="btn btn-outline btn-sm"
            target="_blank"
          >
            全屏预览
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存 HTML"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "8px", padding: "8px 12px", fontSize: "13px" }}
        >
          {message.text}
        </div>
      )}

      {warnings.length > 0 && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "6px",
            padding: "8px 12px",
            marginBottom: "8px",
            fontSize: "13px",
            color: "#92400e",
          }}
        >
          {warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}

      <div
        style={{
          display: previewMode === "side" ? "grid" : "block",
          gridTemplateColumns: previewMode === "side" ? "1fr 1fr" : "1fr",
          gap: "16px",
        }}
      >
        {/* HTML 编辑器 */}
        <div>
          <textarea
            className="form-textarea"
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder={`在此粘贴 HTML 代码...

支持普通 HTML、CSS、白名单 iframe（微赞、B站、腾讯视频、保利威）

注意：
• script 标签会被自动移除
• javascript: 伪协议会被移除
• onerror/onload 等事件属性会被移除
• 非白名单 iframe 会显示提示信息`}
            rows={previewMode === "side" ? 24 : 18}
            style={{
              fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          />
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            提示：电脑端粘贴更稳定，手机微信不适合编辑大段 HTML
          </div>
        </div>

        {/* 侧边预览 */}
        {previewMode === "side" && (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              overflow: "hidden",
              background: "#ffffff",
              minHeight: "400px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "6px 12px",
                fontSize: "12px",
                color: "#64748b",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              预览
              {htmlCode && sanitized.iframeBlocked && (
                <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
                  该播放器可能限制嵌入，请检查第三方平台 iframe 地址。
                </span>
              )}
            </div>
            <div style={{ height: "400px", overflow: "auto" }}>
              {htmlCode ? (
                <iframe
                  srcDoc={wrapHtmlForDisplay(sanitized.html)}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  sandbox="allow-scripts"
                  title="HTML 预览"
                />
              ) : (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                  尚未录入 HTML 内容
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
