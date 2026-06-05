"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  appNo: string;
  teamName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  commitmentAgreed: boolean;
  commitmentVersion: string;
  commitmentAgreedAt: string;
  ip: string;
  userAgent: string | null;
  status: string;
  createdAt: string;
}

interface LinkedCase {
  id: string;
  caseNo: string;
  name: string;
  status: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "待处理", color: "#d97706", bg: "#fffbeb" },
  CONTACTED: { label: "已联系", color: "#2563eb", bg: "#eff6ff" },
  CONVERTED: { label: "已转为案例", color: "#16a34a", bg: "#f0fdf4" },
  REJECTED: { label: "已拒绝", color: "#64748b", bg: "#f1f5f9" },
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [linkedCase, setLinkedCase] = useState<LinkedCase | null>(null);
  const [community, setCommunity] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [res, comRes] = await Promise.all([
      fetch(`/api/admin/applications/${id}`),
      fetch("/api/admin/community"),
    ]);
    const data = await res.json();
    const comData = await comRes.json();
    setApp(data.application);
    setLinkedCase(data.linkedCase || null);
    setCommunity(comData || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatus = async (status: string) => {
    setActionLoading(true);
    const res = await fetch(`/api/admin/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { setMsg("操作成功"); load(); }
    else { setMsg("操作失败"); }
    setActionLoading(false);
    setTimeout(() => setMsg(""), 2000);
  };

  const handleConvert = async () => {
    if (!confirm("确认将此申请转为导播案例草稿吗？")) return;
    setActionLoading(true);
    const res = await fetch(`/api/admin/applications/${id}/convert`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || "转换失败"); setActionLoading(false); return; }
    setMsg("已转为导播案例草稿");
    setActionLoading(false);
    router.push(`/admin/cases/${data.caseId}`);
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); setMsg("已复制"); setTimeout(() => setMsg(""), 2000); };

  if (loading) return <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>;
  if (!app) return <div className="alert alert-error">申请不存在</div>;

  const st = STATUS_MAP[app.status] || STATUS_MAP.PENDING;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/admin/applications" className="btn btn-outline btn-sm">返回申请列表</Link>
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{msg}</div>}

      {/* 申请编号醒目展示 */}
      <div className="card" style={{ marginBottom: "16px", textAlign: "center", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe" }}>
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>申请编号</div>
        <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: "monospace", color: "#1e40af", letterSpacing: "3px" }}>
          {app.appNo}
        </div>
        <div style={{ marginTop: "8px" }}>
          <button className="btn btn-outline btn-sm" onClick={() => copy(app.appNo)}>复制编号</button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 className="card-title" style={{ margin: 0 }}>申请信息</h3>
          <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 500, color: st.color, background: st.bg }}>{st.label}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
          <div><span style={{ color: "#94a3b8" }}>团队名称：</span><strong>{app.teamName}</strong></div>
          <div><span style={{ color: "#94a3b8" }}>联系人：</span>{app.contactName} <button className="btn btn-outline btn-sm" onClick={() => copy(app.contactName)} style={{ padding: "1px 6px", fontSize: "11px", marginLeft: "4px" }}>复制</button></div>
          <div><span style={{ color: "#94a3b8" }}>联系电话：</span><span style={{ fontFamily: "monospace" }}>{app.contactPhone}</span> <button className="btn btn-outline btn-sm" onClick={() => copy(app.contactPhone)} style={{ padding: "1px 6px", fontSize: "11px", marginLeft: "4px" }}>复制</button></div>
          <div><span style={{ color: "#94a3b8" }}>邮箱：</span>{app.contactEmail} <button className="btn btn-outline btn-sm" onClick={() => copy(app.contactEmail)} style={{ padding: "1px 6px", fontSize: "11px", marginLeft: "4px" }}>复制</button></div>
        </div>
      </div>

      {/* 承诺书 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">电子承诺书</h3>
        <div style={{ fontSize: "14px" }}>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#94a3b8" }}>状态：</span>
            {app.commitmentAgreed ? <span style={{ color: "#16a34a" }}>已确认</span> : "未确认"}
          </div>
          <div style={{ marginBottom: "4px" }}><span style={{ color: "#94a3b8" }}>版本：</span>{app.commitmentVersion}</div>
          <div style={{ marginBottom: "4px" }}><span style={{ color: "#94a3b8" }}>确认时间：</span>{new Date(app.commitmentAgreedAt).toLocaleString("zh-CN")}</div>
        </div>
      </div>

      {/* 提交信息 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">提交信息</h3>
        <div style={{ fontSize: "14px" }}>
          <div style={{ marginBottom: "4px" }}><span style={{ color: "#94a3b8" }}>提交时间：</span>{new Date(app.createdAt).toLocaleString("zh-CN")}</div>
          <div style={{ marginBottom: "4px" }}><span style={{ color: "#94a3b8" }}>IP：</span><span style={{ fontFamily: "monospace", fontSize: "12px" }}>{app.ip}</span></div>
          {app.userAgent && <div style={{ fontSize: "11px", color: "#94a3b8", wordBreak: "break-all" }}>UA: {app.userAgent}</div>}
        </div>
      </div>

      {/* 关联案例 */}
      {linkedCase && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 className="card-title">关联案例</h3>
          <div style={{ fontSize: "14px" }}>
            <Link href={`/admin/cases/${linkedCase.id}`} style={{ color: "#2563eb" }}>#{linkedCase.caseNo} {linkedCase.name}</Link>
            <span style={{ marginLeft: "8px", fontSize: "12px", color: "#64748b" }}>{linkedCase.status}</span>
          </div>
        </div>
      )}

      {/* 联系方式引导 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">用户引导信息</h3>
        <div style={{ fontSize: "14px" }}>
          <div style={{ marginBottom: "4px", color: "#64748b" }}>已提示用户通过以下方式联系管理员并备注申请编号。</div>
          {community.adminWechat ? (
            <div style={{ marginBottom: "4px" }}><span style={{ color: "#94a3b8" }}>微信：</span><strong>{community.adminWechat}</strong></div>
          ) : <div style={{ color: "#94a3b8", marginBottom: "4px" }}>微信：未配置</div>}
          {(community.qqGroupNo || community.qqGroupUrl) ? (
            <div><span style={{ color: "#94a3b8" }}>QQ 群：</span><strong>{community.qqGroupNo || community.qqGroupUrl}</strong></div>
          ) : <div style={{ color: "#94a3b8" }}>QQ 群：未配置</div>}
        </div>
      </div>

      {/* 操作 */}
      <div className="card">
        <h3 className="card-title">操作</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {app.status === "PENDING" && (
            <>
              <button className="btn btn-outline btn-sm" style={{ color: "#2563eb", borderColor: "#bfdbfe" }} onClick={() => handleStatus("CONTACTED")} disabled={actionLoading}>标记为已联系</button>
              <button className="btn btn-outline btn-sm" style={{ color: "#dc2626", borderColor: "#fecaca" }} onClick={() => handleStatus("REJECTED")} disabled={actionLoading}>拒绝申请</button>
              <button className="btn btn-primary btn-sm" onClick={handleConvert} disabled={actionLoading}>转为导播案例</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
