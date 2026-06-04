"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  caseTotal: number;
  publishedCount: number;
  draftCount: number;
  unpublishedCount: number;
  rejectedCount: number;
  pendingComplaints: number;
  toolCount: number;
  communityOpen: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
        加载中...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-error">加载数据失败</div>
    );
  }

  const stats = [
    {
      label: "案例总数",
      value: data.caseTotal,
      color: "#2563eb",
    },
    {
      label: "已发布",
      value: data.publishedCount,
      color: "#16a34a",
      href: "/admin/cases?status=PUBLISHED",
    },
    {
      label: "草稿",
      value: data.draftCount,
      color: "#64748b",
      href: "/admin/cases?status=DRAFT",
    },
    {
      label: "已下架",
      value: data.unpublishedCount,
      color: "#dc2626",
      href: "/admin/cases?status=UNPUBLISHED",
    },
    {
      label: "已拒绝",
      value: data.rejectedCount,
      color: "#d97706",
      href: "/admin/cases?status=REJECTED",
    },
    {
      label: "待处理投诉",
      value: data.pendingComplaints,
      color: data.pendingComplaints > 0 ? "#dc2626" : "#16a34a",
      href: "/admin/complaints",
      highlight: data.pendingComplaints > 0,
    },
    {
      label: "工具数量",
      value: data.toolCount,
      color: "#7c3aed",
      href: "/admin/tools",
    },
    {
      label: "社群状态",
      value: data.communityOpen ? "开放" : "关闭",
      color: data.communityOpen ? "#16a34a" : "#64748b",
      href: "/admin/community",
      isText: true,
    },
  ];

  return (
    <div className="page-enter">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat) => {
          const content = (
            <div
              className="stat-card"
              style={{
                cursor: stat.href ? "pointer" : "default",
                borderLeft: `3px solid ${stat.color}`,
                ...(stat.highlight
                  ? {
                      background: "#fef2f2",
                      borderColor: "#dc2626",
                    }
                  : {}),
              }}
            >
              <div
                className="stat-card-value"
                style={{
                  color: stat.color,
                  fontSize: stat.isText ? "16px" : "28px",
                }}
              >
                {stat.value}
              </div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          );

          if (stat.href) {
            return (
              <Link
                key={stat.label}
                href={stat.href}
                style={{ textDecoration: "none" }}
              >
                {content}
              </Link>
            );
          }
          return <div key={stat.label}>{content}</div>;
        })}
      </div>

      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
          快捷操作
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/cases/new" className="btn btn-primary">
            创建导播案例
          </Link>
          <Link href="/admin/cases" className="btn btn-outline">
            管理导播案例
          </Link>
          <Link href="/admin/complaints" className="btn btn-outline">
            投诉管理
          </Link>
          <Link href="/admin/tools" className="btn btn-outline">
            导播工具管理
          </Link>
          <Link href="/admin/community" className="btn btn-outline">
            社群配置
          </Link>
        </div>
      </div>
    </div>
  );
}
