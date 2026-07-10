'use client';
import React, { useState, useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';
import * as echarts from 'echarts';

function ProfesorResultadosPage() {

  useEffect(() => {
    // Inicializar ECharts
    const aprovedAndReprovedChartDom = document.getElementById('aproved-and-reproved-chart') as HTMLDivElement | null;
    const timelineChartDom = document.getElementById('timeline-chart') as HTMLDivElement | null;
    if (!aprovedAndReprovedChartDom || !timelineChartDom) return;

    const myChart = echarts.init(aprovedAndReprovedChartDom);
    const timelineChart = echarts.init(timelineChartDom);

    const calificacionesStatus: Record<string, string> = {
      Aprobados: '#16a34a',  // verde
      Reprobados: '#ef4444', // rojo
    };

    const aprovedAndReprovedChartOptions = {
      title: {
        text: 'Estatus de Participantes',
        textStyle: { color: '#ffffff' }
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: [ 'Aprobados', 'Reprobados' ],
        axisLabel: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: {
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#1f2937' } }
      },
      series: [
        {
          name: 'Puntaje',
          type: 'bar',
          itemStyle: {
            color: function (params: any) {
              return calificacionesStatus[params.name] || '#3b82f6';
            }
          },
          data: [5, 20]
        }
      ]
    };

    const timelineChartOptions = {
      // color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
      title: {
        text: 'Actividad de Participación a lo largo del tiempo',
        textStyle: { color: '#ffffff' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Ssep', 'Oct', 'Nov', 'Dic'],
          axisLabel: { color: '#ffffff' },
          axisLine: { lineStyle: { color: '#334155' } }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: { color: '#ffffff' },
        }
      ],
      series: [
        {
          name: 'Participaciones',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(55, 162, 255)'
              },
              {
                offset: 1,
                color: 'rgb(116, 21, 219)'
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: [320, 132, 201, 334, 190, 130, 220]
        }
      ]
    }

    myChart.setOption(aprovedAndReprovedChartOptions);
    timelineChart.setOption(timelineChartOptions);

    const resize = () => myChart.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      myChart.dispose();
    };
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">

      <div className="p-4">
        <div className="flex space-x-4">
          <div id="timeline-chart" style={{ width: '70%', height: '400px' }}></div>
          <div id="aproved-and-reproved-chart" style={{ width: '30%', height: '400px' }}></div>
        </div>
        <div className="mt-4">
          <h2 className="text-white font-bold text-lg mb-2">Detalles de Participación</h2>
          <table className="min-w-full bg-slate-900 border border-slate-800 rounded-xl">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-slate-800 text-left text-slate-400">Estudiante</th>
                <th className="px-4 py-2 border-b border-slate-800 text-left text-slate-400">Puntaje</th>
                <th className="px-4 py-2 border-b border-slate-800 text-left text-slate-400">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {/* Aquí puedes mapear los resultados reales */}
              <tr>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">Estudiante 1</td>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">36</td>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">5 min</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">Estudiante 2</td>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">20</td>
                <td className="px-4 py-2 border-b border-slate-800 text-slate-300">7 min</td>
              </tr>
              {/* Agrega más filas según sea necesario */}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Métricas Generales</h2>
          <p className="text-slate-400">Promedio de Puntaje: 28</p>
          <p className="text-slate-400">Tiempo Promedio: 6 min</p>
          <p className="text-slate-400">Número de Participantes: 5</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Comentarios de Estudiantes</h2>
          <ul className="list-disc list-inside text-slate-400">
            <li>Estudiante 1: "Me gustó mucho el desafío, fue divertido."</li>
            <li>Estudiante 2: "Algunas preguntas fueron difíciles, pero aprendí mucho."</li>
            <li>Estudiante 3: "El tiempo fue un poco corto para responder todas las preguntas."</li>
            {/* Agrega más comentarios según sea necesario */}
          </ul>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Acciones</h2>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Descargar Resultados
          </button>
          <button className="ml-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Enviar Retroalimentación
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Resumen del Desafío</h2>
          <p className="text-slate-400">Título: Capitales de Europa</p>
          <p className="text-slate-400">Descripción: Un desafío para identificar las capitales de los países europeos.</p>
          <p className="text-slate-400">Número de Preguntas: 10</p>
          <p className="text-slate-400">Número de Vidas: 3</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Sugerencias para Futuras Ediciones</h2>
          <ul className="list-disc list-inside text-slate-400">
            <li>Considerar aumentar el tiempo límite para responder las preguntas.</li>
            <li>Agregar más pistas o ayudas para los estudiantes que tengan dificultades.</li>
            <li>Incluir una sección de retroalimentación al final del desafío para mejorar la experiencia.</li>
          </ul>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Estadísticas de Participación</h2>
          <p className="text-slate-400">Número de Estudiantes que Completaron el Desafío: 4</p>
          <p className="text-slate-400">Número de Estudiantes que Abandonaron: 1</p>
          <p className="text-slate-400">Tasa de Finalización: 80%</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Próximos Desafíos</h2>
          <p className="text-slate-400">Se recomienda crear desafíos con niveles de dificultad variados para mantener el interés de los estudiantes.</p>
          <p className="text-slate-400">Explorar temas relacionados con geografía, historia y cultura para diversificar los desafíos.</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Conclusión</h2>
          <p className="text-slate-400">El desafío fue exitoso en términos de participación y aprendizaje. Se sugiere continuar con la creación de desafíos interactivos y educativos para mejorar la experiencia de los estudiantes.</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Agradecimientos</h2>
          <p className="text-slate-400">Gracias a todos los estudiantes que participaron en el desafío y proporcionaron retroalimentación valiosa para mejorar futuras ediciones.</p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Contacto</h2>
          <p className="text-slate-400">Para cualquier consulta o sugerencia, por favor contacta al equipo de soporte a través del correo electrónico:
          <a href="mailto:soporte@desafio.com" className="text-blue-400 hover:underline">
            soporte@desafio.com
          </a>
          </p>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold text-lg mb-2">Recursos Adicionales</h2>
          <p className="text-slate-400">Se recomienda revisar los siguientes recursos para mejorar la experiencia de los estudiantes en futuros desafíos:</p>
          <ul className="list-disc list-inside text-slate-400">
            <li><a href="https://www.geography.com" className="text-blue-400 hover:underline">Geography.com</a> - Recursos educativos sobre geografía.</li>
            <li><a href="https://www.history.com" className="text-blue-400 hover:underline">History.com</a> - Información histórica y cultural.</li>
            <li><a href="https://www.education.com" className="text-blue-400 hover:underline">Education.com</a> - Material educativo y actividades para estudiantes.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default ProfesorResultadosPage;