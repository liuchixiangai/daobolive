"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface CaseDetail {
  id: string;
  caseNo: string;
  name: string;
  directorName: string;
  teamName: string | null;
  category: string | null;
  province: string | null;
  city: string | null;
  techTags: string | null;
  summary: string | null;
  teamDisplay: string | null;
  htmlContent: string | null;
  status: string;
  contactInfo: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactWechat: string | null;
  contactEmail: string | null;
}

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/cases/${id}`)
      .then((res) => res.json())
      .then((data) => setCaseData(data.case))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
        加载中...
      </div>
    );
  }

  if (!caseData) {
    return <div className="alert alert-error">案例不存在</div>;
  }

  const tags = caseData.techTags
    ? caseData.techTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const location = [caseData.province, caseData.city].filter(Boolean).join(" ");

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}>
        <Link href={`/admin/cases/${caseData.id}`} className="btn btn-outline btn-sm">
          返回编辑
        </Link>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* HTML 主体内容 */}
        {caseData.htmlContent ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
            dangerouslySetInnerHTML={{ __html: caseData.htmlContent }}
          />
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", marginBottom: "16px" }}>
            尚未录入 HTML 内容
          </div>
        )}

        {/* 案例信息卡 */}
        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
            {caseData.name}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
            <div><span style={{ color: "#94a3b8" }}>案例编号：</span>#{caseData.caseNo}</div>
            <div><span style={{ color: "#94a3b8" }}>导播姓名：</span>{caseData.directorName}</div>
            {caseData.teamName && (
              <div><span style={{ color: "#94a3b8" }}>团队名称：</span>{caseData.teamName}</div>
            )}
            {location && (
              <div><span style={{ color: "#94a3b8" }}>所在地区：</span>{location}</div>
            )}
            {caseData.category && (
              <div><span style={{ color: "#94a3b8" }}>活动分类：</span>{caseData.category}</div>
            )}
          </div>
          {caseData.summary && (
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px", lineHeight: 1.6 }}>{caseData.summary}</p>
          )}
          {caseData.teamDisplay && (
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>{caseData.teamDisplay}</p>
          )}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
              {tags.map((tag) => (
                <span key={tag} style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "4px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
