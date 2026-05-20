import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#c084fc", "#f472b6", "#67e8f9", "#a3e635", "#fb923c"];

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card-value">{value ?? "—"}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}

function Dashboard({ posts }) {
  const [commentCount, setCommentCount]     = useState(0);
  const [reactionCount, setReactionCount]   = useState(0);
  const [uniqueUsers, setUniqueUsers]       = useState(0);
  const [loadingStats, setLoadingStats]     = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: comments },
        { count: reactions },
        { data: reactionRows },
      ] = await Promise.all([
        supabase
          .from("post_comments")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("post_reactions")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("post_reactions")
          .select("visitor_id"),
      ]);

      setCommentCount(comments || 0);
      setReactionCount(reactions || 0);

      // Unique users who have reacted (non-null visitor_id)
      if (reactionRows) {
        const ids = new Set(
          reactionRows.map((r) => r.visitor_id).filter(Boolean)
        );
        setUniqueUsers(ids.size);
      }

      setLoadingStats(false);
    }

    fetchStats();
  }, [posts]);

  // ── Métricas ────────────────────────────────────────────────────────────────
  const totalPosts  = posts.length;
  const published   = posts.filter((p) => p.is_published || p.published).length;
  const drafts      = totalPosts - published;
  const totalLikes  = posts.reduce((s, p) => s + (p.likes  || 0), 0);
  const totalHearts = posts.reduce((s, p) => s + (p.hearts || 0), 0);
  const totalViews  = posts.reduce((s, p) => s + (p.views  || 0), 0);

  function popularityScore(p) {
    return (p.views || 0) + (p.likes || 0) * 3 + (p.hearts || 0) * 3;
  }

  const mostPopular = [...posts].sort((a, b) => popularityScore(b) - popularityScore(a))[0];

  // ── Datos para gráficas ──────────────────────────────────────────────────────
  const pieData = [
    { name: "Publicadas", value: published },
    { name: "Borradores", value: drafts },
  ].filter((d) => d.value > 0);

  // Posts por categoría
  const byCategory = posts.reduce((acc, p) => {
    const cat = p.category || "Sin categoría";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(byCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top 5 por popularidad
  const top5 = [...posts]
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, 5)
    .map((p) => ({
      name: p.title.length > 20 ? p.title.slice(0, 20) + "…" : p.title,
      score: popularityScore(p),
      likes: p.likes || 0,
      hearts: p.hearts || 0,
    }));

  // ── Tooltip personalizado ─────────────────────────────────────────────────
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="dashboard-grid">
        <StatCard label="Total publicaciones" value={totalPosts} />
        <StatCard label="Publicadas" value={published} />
        <StatCard label="Borradores" value={drafts} />
        <StatCard label="Total likes 👍" value={totalLikes} />
        <StatCard label="Total corazones ❤️" value={totalHearts} />
        <StatCard label="Vistas totales 👁" value={totalViews} />
        <StatCard
          label="Total comentarios 💬"
          value={loadingStats ? "..." : commentCount}
        />
        <StatCard
          label="Total reacciones"
          value={loadingStats ? "..." : reactionCount}
          sub={loadingStats ? null : `${uniqueUsers} usuario${uniqueUsers !== 1 ? "s" : ""} únicos`}
        />
        <StatCard
          label="Más popular"
          value={
            mostPopular
              ? mostPopular.title.slice(0, 22) + (mostPopular.title.length > 22 ? "…" : "")
              : "—"
          }
          sub={mostPopular ? `Score: ${popularityScore(mostPopular)}` : null}
        />
      </div>

      {/* ── Gráficas ──────────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <>
          <div className="charts-row">
            {/* Publicadas vs Borradores */}
            <div className="chart-card">
              <h3 className="chart-title">Publicadas vs Borradores</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Posts por categoría */}
            {categoryData.length > 0 && (
              <div className="chart-card">
                <h3 className="chart-title">Posts por categoría</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#b8a0d8" }}
                      angle={-35}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#b8a0d8" }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#c084fc" radius={[4, 4, 0, 0]} name="Posts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top 5 más populares */}
          {top5.length > 0 && (
            <div className="chart-card chart-card--full">
              <h3 className="chart-title">Top 5 más populares (score = vistas + likes×3 + corazones×3)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={top5} margin={{ top: 4, right: 8, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#b8a0d8" }}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#b8a0d8" }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="likes"  fill="#c084fc" radius={[4,4,0,0]} name="Likes" />
                  <Bar dataKey="hearts" fill="#f472b6" radius={[4,4,0,0]} name="Corazones" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {posts.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <p>Aún no hay publicaciones para mostrar estadísticas.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
