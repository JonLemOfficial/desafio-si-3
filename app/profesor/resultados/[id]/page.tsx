'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import * as echarts from 'echarts';

interface ResultEntry {
  id: number;
  usuario_id: number;
  nombre_usuario: string;
  puntaje: number;
  desafio_titulo: string;
  creado_en: string;
}

interface ResultMetrics {
  total_participaciones: number;
  participantes_unicos: number;
  promedio_puntaje: number;
  aprobados: number;
  reprobados: number;
  ultima_participacion: string | null;
}

interface ResultData {
  desafio: {
    id: number;
    titulo: string;
    descripcion: string;
    continente: string | null;
    num_preguntas: number;
    vidas: number;
    activo: boolean;
    profesor_id: number;
    profesor_nombre?: string;
    creado_en: string;
  };
  metrics: ResultMetrics;
  entries: ResultEntry[];
  timeline: { label: string; value: number }[];
}

function ProfesorResultadosPage() {
  const params = useParams();
  const { id } = params || {};
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");

  const chartRef = useRef<echarts.ECharts | null>(null);
  const timelineRef = useRef<echarts.ECharts | null>(null);
  const chartDomRef = useRef<HTMLDivElement | null>(null);
  const timelineDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/profesor/resultados/${id}`);
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || 'No se pudieron cargar los resultados.');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!data || !chartDomRef.current || !timelineDomRef.current) return;

    const barChart = echarts.init(chartDomRef.current);
    const lineChart = echarts.init(timelineDomRef.current);
    chartRef.current = barChart;
    timelineRef.current = lineChart;

    const barOptions = {
      title: {
        text: 'Aprobados vs Reprobados',
        left: 'center',
        textStyle: { color: '#ffffff', fontSize: 16 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: ['Aprobados', 'Reprobados'],
        axisLabel: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#94a3b8' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#1f2937' } }
      },
      series: [
        {
          name: 'Participaciones',
          type: 'bar',
          data: [data.metrics.aprobados, data.metrics.reprobados],
          itemStyle: {
            color: (params: any) => (params.name === 'Aprobados' ? '#16a34a' : '#ef4444')
          },
          label: {
            show: true,
            position: 'top',
            color: '#e2e8f0',
            fontWeight: 700
          }
        }
      ]
    };

    const lineOptions = {
      title: {
        text: 'Participaciones por mes',
        left: 'center',
        textStyle: { color: '#ffffff', fontSize: 16 }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.timeline.map((item) => item.label),
        axisLabel: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#94a3b8' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#1f2937' } }
      },
      series: [
        {
          name: 'Participaciones',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          sampling: 'average',
          itemStyle: { color: '#38bdf8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56,189,248,0.75)' },
              { offset: 1, color: 'rgba(56,189,248,0.15)' }
            ])
          },
          data: data.timeline.map((item) => item.value)
        }
      ]
    };

    barChart.setOption(barOptions);
    lineChart.setOption(lineOptions);

    const resize = () => {
      barChart.resize();
      lineChart.resize();
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      barChart.dispose();
      lineChart.dispose();
    };
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    return data.entries.filter((entry) =>
      entry.nombre_usuario.toLowerCase().includes(participantSearch.toLowerCase()) ||
      String(entry.puntaje).includes(participantSearch)
    );
  }, [data, participantSearch]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="p-4 bg-slate-950/80 rounded-3xl border border-slate-800 shadow-lg shadow-slate-950/20">
        {loading ? (
          <div className="text-center py-24 text-slate-400">Cargando métricas...</div>
        ) : error ? (
          <div className="text-center py-24 text-red-400">{error}</div>
        ) : !data ? (
          <div className="text-center py-24 text-slate-400">No se encontraron resultados para este desafío.</div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr] mb-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5">
                  <h1 className="text-white text-xl font-semibold mb-2">{data.desafio.titulo}</h1>
                  <p className="text-slate-400 text-sm">{data.desafio.descripcion}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-slate-400 text-xs">
                    <span className="rounded-full bg-slate-950/70 px-3 py-1">Continente: {data.desafio.continente ?? 'Global'}</span>
                    <span className="rounded-full bg-slate-950/70 px-3 py-1">Preguntas: {data.desafio.num_preguntas}</span>
                    <span className="rounded-full bg-slate-950/70 px-3 py-1">Vidas: {data.desafio.vidas}</span>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[
                    { label: 'Participaciones', value: data.metrics.total_participaciones },
                    { label: 'Participantes únicos', value: data.metrics.participantes_unicos },
                    { label: 'Promedio', value: `${data.metrics.promedio_puntaje.toFixed(1)} pts` },
                    { label: 'Última participación', value: data.metrics.ultima_participacion ?? 'Nunca' }
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
                      <p className="text-slate-400 text-xs uppercase tracking-[0.18em] mb-2">{item.label}</p>
                      <p className="text-white text-2xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
                  <p className="text-slate-400 text-sm">Aprobados / Reprobados</p>
                  <div ref={chartDomRef} className="mt-4 h-72" />
                </div>
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
                  <p className="text-slate-400 text-sm">Participación mensual</p>
                  <div ref={timelineDomRef} className="mt-4 h-72" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.65fr] mb-6">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-white text-lg font-semibold">Participaciones recientes</h2>
                    <p className="text-slate-500 text-sm">Filtra por estudiante o puntaje.</p>
                  </div>
                  <input
                    value={participantSearch}
                    onChange={(event) => setParticipantSearch(event.target.value)}
                    placeholder="Buscar participante"
                    className="min-w-[180px] rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3">Participante</th>
                        <th className="px-4 py-3">Puntaje</th>
                        <th className="px-4 py-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                            No hay participaciones que coincidan.
                          </td>
                        </tr>
                      ) : filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-900/80">
                          <td className="px-4 py-3">{entry.nombre_usuario}</td>
                          <td className="px-4 py-3 font-semibold text-white">{entry.puntaje}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(entry.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4">
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="text-slate-400 text-sm">Resumen rápido</p>
                  <p className="text-white text-3xl font-semibold mt-2">{data.metrics.total_participaciones}</p>
                  <p className="text-slate-500 text-sm">participaciones totales</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-slate-950/70 p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.18em]">Aprobados</p>
                    <p className="text-emerald-400 text-2xl font-semibold">{data.metrics.aprobados}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.18em]">Reprobados</p>
                    <p className="text-red-400 text-2xl font-semibold">{data.metrics.reprobados}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default ProfesorResultadosPage;
