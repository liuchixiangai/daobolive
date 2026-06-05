"use client";

import { useState, useEffect } from "react";

interface CommunityContact {
  adminWechat?: string | null;
  wechatQrUrl?: string | null;
  showWechat?: boolean;
  qqGroupNo?: string | null;
  qqGroupUrl?: string | null;
  qqQrUrl?: string | null;
  showQqGroup?: boolean;
}

export default function ApplyPage() {
  const [teamName, setTeamName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ appNo: string } | null>(null);
  const [community, setCommunity] = useState<CommunityContact>({});

  useEffect(() => {
    fetch("/api/community/config").then(r => r.json()).then(setCommunity).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim()) { setError("请填写团队名称。"); return; }
    if (!contactName.trim()) { setError("请填写联系人。"); return; }
    if (!contactPhone.trim()) { setError("请填写联系电话。"); return; }
    if (!contactEmail.trim()) { setError("请填写邮箱。"); return; }
    if (!agreed) { setError("请勾选电子承诺书。"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          commitmentAgreed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交失败");
      } else {
        setResult({ appNo: data.appNo });
      }
    } catch {
      setError("网络错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: "500px", margin: "80px auto", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px", color: "#16a34a" }}>&#10003;</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>申请已提交</h2>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px 24px",
            margin: "16px 0",
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>申请编号</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "monospace", color: "#16a34a", letterSpacing: "2px" }}>
            {result.appNo}
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.8, margin: "16px 0" }}>
          请添加管理员微信或加入导播星球 QQ 群，并备注申请编号：
          <strong style={{ color: "#1e40af", display: "block", marginTop: "6px", fontSize: "18px", fontFamily: "monospace" }}>{result.appNo}</strong>
        </p>

        {(community.adminWechat && community.showWechat !== false) && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 16px", margin: "12px 0", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>管理员微信</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>{community.adminWechat}</div>
            {community.wechatQrUrl && (
              <img src={community.wechatQrUrl} alt="微信二维码" style={{ maxWidth: "180px", marginTop: "8px", borderRadius: "6px" }} />
            )}
          </div>
        )}

        {((community.qqGroupNo || community.qqGroupUrl) && community.showQqGroup !== false) && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 16px", margin: "12px 0", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>导播星球 QQ 群</div>
            {community.qqGroupNo && <div style={{ fontSize: "16px", fontWeight: 600, color: "#16a34a", fontFamily: "monospace" }}>{community.qqGroupNo}</div>}
            {community.qqQrUrl && (
              <img src={community.qqQrUrl} alt="QQ群二维码" style={{ maxWidth: "180px", marginTop: "8px", borderRadius: "6px" }} />
            )}
            {community.qqGroupUrl && (
              <a href={community.qqGroupUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: "8px", display: "inline-block" }}>
                加入 QQ 群
              </a>
            )}
          </div>
        )}

        {(!community.adminWechat && !community.qqGroupNo && !community.qqGroupUrl) && (
          <p style={{ fontSize: "14px", color: "#64748b", margin: "12px 0" }}>
            请联系导播星球管理员，并备注申请编号。
          </p>
        )}

        <p style={{ fontSize: "13px", color: "#94a3b8" }}>
          管理员会根据该编号找到你的申请资料，并与你沟通后续案例发布事宜。
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: "24px", color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          返回首页
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>申请入驻 / 提交导播案例申请</h1>
      <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px" }}>
        填写以下信息，管理员会尽快与你联系。
      </p>
      <p style={{ fontSize: "13px", color: "#64748b", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px", marginBottom: "24px" }}>
        提交申请后，请添加管理员微信或加入 QQ 群，并备注系统生成的申请编号。
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "16px" }}>{error}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">团队名称 <span className="required">*</span></label>
            <input type="text" className="form-input" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="请输入团队名称" maxLength={100} />
          </div>
          <div className="form-group">
            <label className="form-label">联系人 <span className="required">*</span></label>
            <input type="text" className="form-input" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="请输入联系人姓名" maxLength={50} />
          </div>
          <div className="form-group">
            <label className="form-label">联系电话 <span className="required">*</span></label>
            <input type="text" className="form-input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="请输入联系电话" />
          </div>
          <div className="form-group">
            <label className="form-label">邮箱 <span className="required">*</span></label>
            <input type="email" className="form-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="请输入邮箱地址" />
          </div>

          {/* 电子承诺书 */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "12px",
              fontSize: "13px",
              color: "#475569",
              lineHeight: 1.7,
            }}
          >
            我确认提交信息真实有效，并承诺后续发布内容合法合规。如内容涉及侵权、违法、虚假宣传、恶意跳转、违规内容等问题，我愿意配合平台处理和下架。
          </div>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "#2563eb" }}
              />
              <span>我已阅读并同意以上承诺内容。</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? "提交中..." : "提交申请"}
          </button>
        </form>
      </div>
    </div>
  );
}
