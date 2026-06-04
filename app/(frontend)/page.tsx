"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CaseItem {
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
  createdAt: string;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/cases/public?${params.toString()}`);
      const data = await res.json();
      setCases(data.cases || []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  // 初次加载显示最近案例
  useEffect(() => {
    handleSearch();
  }, []);

  // 技术标签颜色映射
  const tagColors: Record<string, string> = {
    "导播": "#2563eb",
    "切像": "#7c3aed",
    "回放": "#0891b2",
    "慢动作": "#059669",
    "字幕": "#d97706",
    "音控": "#dc2626",
    "灯光": "#f59e0b",
    "AR包装": "#4f46e5",
    "虚拟制作": "#9333ea",
    "多机位": "#0d9488",
    "体育赛事": "#2563eb",
    "会议直播": "#0891b2",
    "文艺演出": "#d97706",
    "大型活动": "#dc2626",
    "企业直播": "#059669",
    "线上会议": "#7c3aed",
  };

  return (
    <div>
      {/* 搜索 Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          发现优秀导播案例
        </h1>
        <p
          style={{
            color: "#94a3b8",
            fontSize: "15px",
            marginBottom: "28px",
          }}
        >
          搜索案例名称、编号、导播、地区、技术标签...
        </p>
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            display: "flex",
            gap: "0",
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索案例名称、编号、导播、地区、技术标签..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderRadius: "8px 0 0 8px",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "0 8px 8px 0",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "搜索中..." : "搜索"}
          </button>
        </form>
      </div>

      {/* 案例列表 */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
            搜索中...
          </div>
        ) : searched && cases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
            {searchQuery.trim() ? "暂无匹配案例" : "暂无案例"}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {cases.map((c) => {
              const tags = c.techTags ? c.techTags.split(",").map((t) => t.trim()).filter(Boolean) : [];
              const location = [c.province, c.city].filter(Boolean).join(" ");
              return (
                <Link
                  key={c.id}
                  href={`/p/${c.caseNo}`}
                  style={{
                    display: "block",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "20px 24px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#94a3b8", marginRight: "8px" }}>
                        #{c.caseNo}
                      </span>
                      <span style={{ fontSize: "14px", color: "#64748b" }}>
                        {c.category}
                      </span>
                    </div>
                    {location && (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{location}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "6px", color: "#1e293b" }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px", lineHeight: 1.5 }}>
                    {c.directorName && <span>导播：{c.directorName}</span>}
                    {c.teamName && <span> · 团队：{c.teamName}</span>}
                  </p>
                  {c.summary && (
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "10px", lineHeight: 1.5 }}>
                      {c.summary.length > 120 ? c.summary.slice(0, 120) + "..." : c.summary}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: (tagColors[tag] || "#e2e8f0") + "18",
                            color: tagColors[tag] || "#64748b",
                            border: `1px solid ${(tagColors[tag] || "#e2e8f0")}30`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 6 && (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                          +{tags.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
