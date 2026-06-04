"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CaseForm, { CaseFormData } from "../CaseForm";
import HtmlEditor from "../HtmlEditor";
import CommitmentUpload from "../CommitmentUpload";
import WechatVerify from "../WechatVerify";

interface CaseDetail {
  id: string;
  caseNo: string;
  status: string;
  name: string;
  directorName: string;
  teamName: string | null;
  contactInfo: string | null;
  category: string | null;
  province: string | null;
  city: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactWechat: string | null;
  contactEmail: string | null;
  summary: string | null;
  teamDisplay: string | null;
  techTags: string | null;
  htmlContent: string | null;
  commitmentUploaded: boolean;
  wechatVerified: boolean;
}

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: string; text: string } | null>(null);

  const loadCase = () => {
    setLoading(true);
    fetch(`/api/admin/cases/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("案例不存在");
        return res.json();
      })
      .then((data) => setCaseData(data.case))
      .catch(() => setError("加载案例失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleSubmit = async (data: CaseFormData) => {
    const res = await fetch(`/api/admin/cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "保存失败" };
    }
    loadCase(); // 重新加载数据
    return {};
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/cases/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "操作失败" });
      } else {
        setStatusMsg({ type: "success", text: "操作成功" });
        loadCase();
        router.refresh();
      }
    } catch {
      setStatusMsg({ type: "error", text: "操作失败" });
    } finally {
      setStatusLoading(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleCopyLink = () => {
    if (!caseData) return;
    const url = `${window.location.origin}/p/${caseData.caseNo}`;
    navigator.clipboard.writeText(url).then(() => {
      setStatusMsg({ type: "success", text: "链接已复制" });
      setTimeout(() => setStatusMsg(null), 2000);
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
        加载中...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="alert alert-error">{error || "案例不存在"}</div>
    );
  }

  const formData: CaseFormData & { caseNo?: string; status?: string } = {
    name: caseData.name,
    directorName: caseData.directorName,
    teamName: caseData.teamName || "",
    contactInfo: caseData.contactInfo || "",
    category: caseData.category || "",
    province: caseData.province || "",
    city: caseData.city || "",
    contactPerson: caseData.contactPerson || "",
    contactPhone: caseData.contactPhone || "",
    contactWechat: caseData.contactWechat || "",
    contactEmail: caseData.contactEmail || "",
    summary: caseData.summary || "",
    teamDisplay: caseData.teamDisplay || "",
    techTags: caseData.techTags || "",
    caseNo: caseData.caseNo,
    status: caseData.status,
  };

  const statusLabel: Record<string, string> = {
    DRAFT: "草稿",
    PUBLISHED: "已发布",
    UNPUBLISHED: "已下架",
    REJECTED: "已拒绝",
  };

  const statusColor: Record<string, string> = {
    DRAFT: "#64748b",
    PUBLISHED: "#16a34a",
    UNPUBLISHED: "#dc2626",
    REJECTED: "#9333ea",
  };

  return (
    <div className="page-enter">
      {/* 顶部操作按钮栏 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              案例 #{caseData.caseNo}
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 500,
                color: statusColor[caseData.status],
                background: statusColor[caseData.status] + "15",
              }}
            >
              {statusLabel[caseData.status]}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {/* 所有状态都可以复制链接 */}
            <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyLink}>
              复制链接
            </button>

            {/* 全屏预览 - 所有状态 */}
            <Link href={`/admin/cases/${caseData.id}/preview`} target="_blank" className="btn btn-outline btn-sm">
              全屏预览
            </Link>

            {/* 草稿：发布 */}
            {caseData.status === "DRAFT" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleStatusChange("PUBLISHED")}
                disabled={statusLoading}
              >
                {statusLoading ? "处理中..." : "发布案例"}
              </button>
            )}

            {/* 已发布：打开公开页 + 下架 */}
            {caseData.status === "PUBLISHED" && (
              <>
                <Link href={`/p/${caseData.caseNo}`} target="_blank" className="btn btn-primary btn-sm">
                  打开公开页
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: "#dc2626", borderColor: "#fecaca" }}
                  onClick={() => handleStatusChange("UNPUBLISHED")}
                  disabled={statusLoading}
                >
                  下架案例
                </button>
              </>
            )}

            {/* 已下架：恢复发布 */}
            {caseData.status === "UNPUBLISHED" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleStatusChange("PUBLISHED")}
                disabled={statusLoading}
              >
                恢复发布
              </button>
            )}

            {/* 已拒绝：恢复为草稿 */}
            {caseData.status === "REJECTED" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleStatusChange("DRAFT")}
                disabled={statusLoading}
              >
                恢复为草稿
              </button>
            )}

            <Link href="/admin/cases" className="btn btn-outline btn-sm">
              返回列表
            </Link>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`alert ${statusMsg.type === "success" ? "alert-success" : "alert-error"}`}
            style={{ marginTop: "8px", padding: "6px 12px", fontSize: "13px" }}
          >
            {statusMsg.text}
          </div>
        )}
      </div>

      {/* 表单内容 */}
      <CaseForm mode="edit" initialData={formData} onSubmit={handleSubmit} />

      {/* 承诺书上传 */}
      <CommitmentUpload caseId={caseData.id} />

      {/* 微信核验 */}
      <WechatVerify caseId={caseData.id} verified={caseData.wechatVerified} />

      {/* HTML 编辑器 */}
      <HtmlEditor caseId={caseData.id} initialHtml={caseData.htmlContent} />
    </div>
  );
}
