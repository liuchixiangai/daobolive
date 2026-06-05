"use client";

import { useEffect, useState } from "react";

export default function AdminCommunityPage() {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/community").then(r => r.json()).then(setConfig).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/community", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setMsg(res.ok ? "已保存" : "保存失败");
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  };

  const set = (key: string, value: any) => setConfig((c: any) => ({ ...c, [key]: value }));

  if (loading) return <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>;

  return (
    <div className="page-enter">
      {msg && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{msg}</div>}

      {/* 社群基础 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">社群基础配置</h3>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">社群名称</label><input className="form-input" value={config.name || ""} onChange={e => set("name", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">社群简介</label><textarea className="form-textarea" value={config.summary || ""} onChange={e => set("summary", e.target.value)} rows={2} /></div>
          <div className="form-group"><label className="form-label">加入说明</label><textarea className="form-textarea" value={config.joinInstruction || ""} onChange={e => set("joinInstruction", e.target.value)} rows={2} /></div>
          <div className="form-group"><label className="form-label">社群规则</label><textarea className="form-textarea" value={config.rules || ""} onChange={e => set("rules", e.target.value)} rows={3} /></div>
          <div className="form-group"><label className="form-label">适合人群</label><input className="form-input" value={config.suitableFor || ""} onChange={e => set("suitableFor", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">不适合人群</label><input className="form-input" value={config.unsuitableFor || ""} onChange={e => set("unsuitableFor", e.target.value)} /></div>
          <div className="form-group"><label className="form-label"><input type="checkbox" checked={!!config.isOpen} onChange={e => set("isOpen", e.target.checked)} style={{ marginRight: "6px" }} />是否开放加入</label></div>
        </div>
      </div>

      {/* 联系方式配置 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">联系方式配置（用于申请成功页引导）</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label"><input type="checkbox" checked={!!config.showWechat} onChange={e => set("showWechat", e.target.checked)} style={{ marginRight: "6px" }} />是否显示微信入口</label>
          </div>
          <div className="form-group">
            <label className="form-label">管理员微信号</label>
            <input className="form-input" value={config.adminWechat || ""} onChange={e => set("adminWechat", e.target.value)} placeholder="微信号" />
          </div>
          <div className="form-group">
            <label className="form-label">微信二维码图片链接（可选）</label>
            <input className="form-input" value={config.wechatQrUrl || ""} onChange={e => set("wechatQrUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label"><input type="checkbox" checked={!!config.showQqGroup} onChange={e => set("showQqGroup", e.target.checked)} style={{ marginRight: "6px" }} />是否显示 QQ 群入口</label>
          </div>
          <div className="form-group">
            <label className="form-label">QQ 群号</label>
            <input className="form-input" value={config.qqGroupNo || ""} onChange={e => set("qqGroupNo", e.target.value)} placeholder="QQ群号" />
          </div>
          <div className="form-group">
            <label className="form-label">QQ 群加入链接（可选）</label>
            <input className="form-input" value={config.qqGroupUrl || ""} onChange={e => set("qqGroupUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">QQ 群二维码图片链接（可选）</label>
            <input className="form-input" value={config.qqQrUrl || ""} onChange={e => set("qqQrUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存配置"}</button>
    </div>
  );
}
