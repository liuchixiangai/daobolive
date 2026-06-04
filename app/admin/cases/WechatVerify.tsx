"use client";

import { useState, useEffect } from "react";

interface WechatVerifyProps {
  caseId: string;
  verified: boolean;
}

export default function WechatVerify({ caseId, verified: initialVerified }: WechatVerifyProps) {
  const [verified, setVerified] = useState(initialVerified);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    setVerified(initialVerified);
  }, [initialVerified]);

  const handleVerify = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cases/${caseId}/wechat-verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "操作失败" });
      } else {
        setVerified(true);
        setShowNote(false);
        setMessage({ type: "success", text: "微信已核验" });
      }
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUnverify = async () => {
    if (!confirm("确定要取消微信核验吗？")) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cases/${caseId}/wechat-verify`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "操作失败" });
      } else {
        setVerified(false);
        setMessage({ type: "success", text: "已取消微信核验" });
      }
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="card" style={{ marginTop: "16px" }}>
      <h3 className="card-title">微信核验</h3>

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "12px", padding: "8px 12px", fontSize: "13px" }}
        >
          {message.text}
        </div>
      )}

      {verified ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <span style={{ color: "#16a34a", fontSize: "14px", fontWeight: 500 }}>
              &#10003; 微信已核验
            </span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleUnverify}
            disabled={loading}
            style={{ color: "#dc2626", borderColor: "#fecaca" }}
          >
            取消核验
          </button>
        </div>
      ) : (
        <div>
          <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
            尚未完成微信核验，请手动确认导播身份后标记。
          </div>
          {showNote && (
            <div className="form-group">
              <textarea
                className="form-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="核验备注（可选）"
                rows={2}
                style={{ marginBottom: "8px" }}
              />
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            {!showNote ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowNote(true)}
              >
                标记微信已核验
              </button>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? "处理中..." : "确认核验"}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowNote(false)}
                >
                  取消
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
