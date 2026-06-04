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
  accessCodeEnabled: boolean;
}

export default function PublicCasePage({
  params,
}: {
  params: Promise<{ caseNo: string }>;
}) {
  const { caseNo } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [needAccessCode, setNeedAccessCode] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/public/${caseNo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.needAccessCode) {
          setNeedAccessCode(true);
          setLoading(false);
        } else if (data.case) {
          setCaseData(data.case);
          setLoading(false);
        } else {
          setError(data.error || "案例不存在");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  }, [caseNo]);

  const handleAccessCodeSubmit = async () => {
    const res = await fetch(`/api/cases/public/${caseNo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });
    const data = await res.json();
    if (data.case) {
      setCaseData(data.case);
      setNeedAccessCode(false);
    } else {
      setError(data.error || "访问码错误");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
        加载中...
      </div>
    );
  }

  if (needAccessCode) {
    return (
      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "24px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>此案例需要访问码</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="请输入访问码"
            />
          </div>
          <button className="btn btn-primary" onClick={handleAccessCodeSubmit} style={{ width: "100%" }}>
            确认
          </button>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div className="alert alert-error">{error || "案例不存在或已下架"}</div>
        <Link href="/" className="btn btn-outline" style={{ marginTop: "16px" }}>
          返回首页
        </Link>
      </div>
    );
  }

  const tags = caseData.techTags ? caseData.techTags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const location = [caseData.province, caseData.city].filter(Boolean).join(" ");

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      {/* 用户 HTML 主体内容 */}
      {caseData.htmlContent && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
          dangerouslySetInnerHTML={{ __html: caseData.htmlContent }}
        />
      )}

      {/* 导播星球案例信息卡 */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
          {caseData.name}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
          <div>
            <span style={{ color: "#94a3b8" }}>案例编号：</span>
            <span>#{caseData.caseNo}</span>
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>导播姓名：</span>
            <span>{caseData.directorName}</span>
          </div>
          {caseData.teamName && (
            <div>
              <span style={{ color: "#94a3b8" }}>团队名称：</span>
              <span>{caseData.teamName}</span>
            </div>
          )}
          {location && (
            <div>
              <span style={{ color: "#94a3b8" }}>所在地区：</span>
              <span>{location}</span>
            </div>
          )}
          {caseData.category && (
            <div>
              <span style={{ color: "#94a3b8" }}>活动分类：</span>
              <span>{caseData.category}</span>
            </div>
          )}
        </div>
        {caseData.summary && (
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px", lineHeight: 1.6 }}>
            {caseData.summary}
          </p>
        )}
        {caseData.teamDisplay && (
          <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>
            {caseData.teamDisplay}
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 投诉入口 */}
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <Link
          href={`/complaint/${caseData.caseNo}`}
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            textDecoration: "none",
          }}
        >
          投诉 / 举报本案例
        </Link>
      </div>
    </div>
  );
}
