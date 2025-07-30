import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { programacionService } from '../services/api';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Estilo para selects negro
const selectStyle = { color: '#111', padding: '0.3rem 0.7rem', borderRadius: 6 };

// Detectar si el tema activo es escala de grises
function isGrisesTheme() {
  if (typeof document !== 'undefined') {
    return document.body.classList.contains('theme-grises');
  }
  return false;
}

function DashboardCharts({ programaciones, aperturas, verificados }) {
  const navigate = useNavigate();
  // Estado para programaciones guardadas
  const [programacionesGuardadas, setProgramacionesGuardadas] = useState([]);

  useEffect(() => {
    async function fetchProgramacionesGuardadas() {
      try {
        const data = await programacionService.getAll();
        setProgramacionesGuardadas(data);
      } catch (e) {
        setProgramacionesGuardadas([]);
      }
    }
    fetchProgramacionesGuardadas();
  }, []);

  // Gráfica de barras: Cantidad de Unidades por Tipo de Unidad (de programaciones guardadas)
  const unidadesPorTipo = {};
  programacionesGuardadas.forEach(pr => {
    const tipo = pr.tipoVehiculo || pr.tipoUnidad || 'Sin tipo';
    const cantidad = pr.cantidadUnidades || 0;
    if (!unidadesPorTipo[tipo]) unidadesPorTipo[tipo] = 0;
    unidadesPorTipo[tipo] += cantidad;
  });
  const barUnidadesPorTipoData = {
    labels: Object.keys(unidadesPorTipo),
    datasets: [
      {
        label: 'Cantidad de Unidades por Tipo',
        data: Object.values(unidadesPorTipo),
        backgroundColor: ['#6F2234', '#1ed618', '#F46036', '#F7B801', '#2E294E'],
      },
    ],
  };

  // Estados para fechas seleccionadas
  const [fechaAperturaEstado, setFechaAperturaEstado] = useState('');
  const [fechaAperturaFecha, setFechaAperturaFecha] = useState('');
  const [filtroAperturaEstado, setFiltroAperturaEstado] = useState('');
  const [filtroAperturaFecha, setFiltroAperturaFecha] = useState('');

  // Estados para filtros de fecha
  const [modoFiltroEstado, setModoFiltroEstado] = useState('mes');
  const [valorFiltroEstado, setValorFiltroEstado] = useState('');
  const [semanaFiltroEstado, setSemanaFiltroEstado] = useState('');
  const [modoFiltroFecha, setModoFiltroFecha] = useState('mes');
  const [valorFiltroFecha, setValorFiltroFecha] = useState('');
  const [semanaFiltroFecha, setSemanaFiltroFecha] = useState('');

  // Función para obtener semanas de un mes
  function obtenerSemanasDelMes(yearMonth) {
    if (!yearMonth) return [];
    const [year, month] = yearMonth.split('-').map(Number);
    const semanas = [];
    const firstDay = new Date(year, month - 1, 1);
    let current = new Date(firstDay);
    while (current.getMonth() === firstDay.getMonth()) {
      // Obtener semana ISO
      const getWeek = d => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
      };
      const semana = getWeek(current);
      if (!semanas.includes(semana)) semanas.push(semana);
      current.setDate(current.getDate() + 1);
    }
    return semanas;
  }

  // Función para filtrar por mes y semana
  function filtrarAperturas(av, modo, mes, semana) {
    let aperturas = av;
    if (modo === 'mes' && mes) {
      aperturas = aperturas.filter(ap => ap.fechaApertura && new Date(ap.fechaApertura).toISOString().slice(0,7) === mes);
      if (semana) {
        aperturas = aperturas.filter(ap => {
          if (!ap.fechaApertura) return false;
          const fecha = new Date(ap.fechaApertura);
          const getWeek = d => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
            return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
          };
          return getWeek(fecha) === semana;
        });
      }
    } else if (modo === 'semana' && semana) {
      aperturas = aperturas.filter(ap => {
        if (!ap.fechaApertura) return false;
        const fecha = new Date(ap.fechaApertura);
        const getWeek = d => {
          d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
          const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
          return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
        };
        return getWeek(fecha) === semana;
      });
    }
    return aperturas;
  }

  const semanasDelMesEstado = obtenerSemanasDelMes(valorFiltroEstado);
  const semanasDelMesFecha = obtenerSemanasDelMes(valorFiltroFecha);

  const aperturasFiltradasEstado = filtrarAperturas(aperturas, modoFiltroEstado, valorFiltroEstado, semanaFiltroEstado);
  const aperturasFiltradasFecha = filtrarAperturas(aperturas, modoFiltroFecha, valorFiltroFecha, semanaFiltroFecha);

  // Gráfica de pastel: Aperturas por Estado (filtrada)
  const estados = aperturasFiltradasEstado.reduce((acc, ap) => {
    acc[ap.estado] = (acc[ap.estado] || 0) + 1;
    return acc;
  }, {});
  const pieAperturasData = {
    labels: Object.keys(estados),
    datasets: [
      {
        data: Object.values(estados),
        backgroundColor: ['#fa020f', '#faa702 ', '#1ed618', '#F7B801', '#2E294E'],
      },
    ],
  };

  // Gráfica de barras: Aperturas por Fecha (filtrada)
  const aperturasPorFecha = aperturasFiltradasFecha.reduce((acc, ap) => {
    const fecha = ap.fechaApertura ? new Date(ap.fechaApertura).toLocaleDateString() : 'Sin fecha';
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});
  const barAperturasFechaData = {
    labels: Object.keys(aperturasPorFecha),
    datasets: [
      {
        label: 'Aperturas por Fecha',
        data: Object.values(aperturasPorFecha),
        backgroundColor: '#B23A48',
      },
    ],
  };


  const grisBtnPrincipal = 'var(--gris-btn-principal)';
  const grisBtnPrincipalHover = 'var(--gris-btn-principal-hover)';
  const grisBtnSecundario = 'var(--gris-btn-secundario)';
  const grisBtnSecundarioHover = 'var(--gris-btn-secundario-hover)';
  const grisBtnTexto = 'var(--gris-btn-texto)';
  const grisBtnTextoInvertido = 'var(--gris-btn-texto-invertido)';
  const grisFondo = 'var(--pantone-468)';
  const grisFondoAlt = 'var(--pantone-468-alt)';
  const grisTitulo = 'var(--pantone-7421)';

  const isGrises = typeof document !== 'undefined' && document.body.classList.contains('theme-grises');

  // Paletas para gráficos en escala de grises
  const grisesPalette = ['#333', '#888', '#bdbdbd', '#e0e0e0', '#f5f5f5'];

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
      <div style={{ width: 350, background: isGrises ? grisFondo : 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ textAlign: 'center', color: isGrises ? grisTitulo : '#6F2234' }}>Cantidad de Unidades</h3>
        <Bar data={{
          ...barUnidadesPorTipoData,
          datasets: [
            {
              ...barUnidadesPorTipoData.datasets[0],
              backgroundColor: isGrises ? grisesPalette : barUnidadesPorTipoData.datasets[0].backgroundColor,
            },
          ],
        }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div style={{ width: 350, background: isGrises ? grisFondo : 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ textAlign: 'center', color: isGrises ? grisTitulo : '#6F2234' }}>Aperturas por Estado</h3>
        <Pie data={{
          ...pieAperturasData,
          datasets: [
            {
              ...pieAperturasData.datasets[0],
              backgroundColor: isGrises ? grisesPalette : pieAperturasData.datasets[0].backgroundColor,
            },
          ],
        }} options={{ responsive: true }} />
        {/* Filtros debajo de la gráfica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={modoFiltroEstado} onChange={e => { setModoFiltroEstado(e.target.value); setValorFiltroEstado(''); setSemanaFiltroEstado(''); }} style={selectStyle}>
              <option value="mes">Mes</option>
              <option value="semana">Semana</option>
            </select>
            {modoFiltroEstado === 'mes' && (
              <input type="month" value={valorFiltroEstado} onChange={e => { setValorFiltroEstado(e.target.value); setSemanaFiltroEstado(''); }} style={{ flex: 1 }} />
            )}
          </div>
          {modoFiltroEstado === 'mes' && valorFiltroEstado && semanasDelMesEstado.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={semanaFiltroEstado} onChange={e => setSemanaFiltroEstado(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                <option value="">Todas las semanas</option>
                {semanasDelMesEstado.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          )}
          {modoFiltroEstado === 'semana' && (
            <input type="week" value={semanaFiltroEstado} onChange={e => setSemanaFiltroEstado(e.target.value)} style={{ flex: 1 }} />
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => {}}
              style={{
                padding: '0.3rem 0.7rem',
                background: isGrises ? grisBtnSecundario : '#6F2234',
                color: isGrises ? grisBtnTextoInvertido : 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >Filtrar</button>
            <button
              onClick={() => { setValorFiltroEstado(''); setSemanaFiltroEstado(''); }}
              style={{
                padding: '0.3rem 0.7rem',
                background: isGrises ? grisBtnPrincipal : '#ccc',
                color: isGrises ? grisBtnTexto : '#222',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >Ver todo</button>
          </div>
        </div>
      </div>
      <div style={{ width: 350, background: isGrises ? grisFondo : 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ textAlign: 'center', color: isGrises ? grisTitulo : '#6F2234' }}>Aperturas por Fecha</h3>
        <Bar data={{
          ...barAperturasFechaData,
          datasets: [
            {
              ...barAperturasFechaData.datasets[0],
              backgroundColor: isGrises ? grisesPalette[2] : barAperturasFechaData.datasets[0].backgroundColor,
            },
          ],
        }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        {/* Filtros debajo de la gráfica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={modoFiltroFecha} onChange={e => { setModoFiltroFecha(e.target.value); setValorFiltroFecha(''); setSemanaFiltroFecha(''); }} style={selectStyle}>
              <option value="mes">Mes</option>
              <option value="semana">Semana</option>
            </select>
            {modoFiltroFecha === 'mes' && (
              <input type="month" value={valorFiltroFecha} onChange={e => { setValorFiltroFecha(e.target.value); setSemanaFiltroFecha(''); }} style={{ flex: 1 }} />
            )}
          </div>
          {modoFiltroFecha === 'mes' && valorFiltroFecha && semanasDelMesFecha.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={semanaFiltroFecha} onChange={e => setSemanaFiltroFecha(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                <option value="">Todas las semanas</option>
                {semanasDelMesFecha.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          )}
          {modoFiltroFecha === 'semana' && (
            <input type="week" value={semanaFiltroFecha} onChange={e => setSemanaFiltroFecha(e.target.value)} style={{ flex: 1 }} />
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => {}}
              style={{
                padding: '0.3rem 0.7rem',
                background: isGrises ? grisBtnSecundario : '#6F2234',
                color: isGrises ? grisBtnTextoInvertido : 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >Filtrar</button>
            <button
              onClick={() => { setValorFiltroFecha(''); setSemanaFiltroFecha(''); }}
              style={{
                padding: '0.3rem 0.7rem',
                background: isGrises ? grisBtnPrincipal : '#ccc',
                color: isGrises ? grisBtnTexto : '#222',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >Ver todo</button>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/apertura', { state: { rutaSeleccionada } })}
        style={{
          padding: '0.3rem 0.7rem',
          background: isGrises ? grisBtnSecundario : '#007bff',
          color: isGrises ? grisBtnTextoInvertido : 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          marginTop: '2rem',
        }}
      >
        Ir a Apertura
      </button>
    </div>
  );
}

export default DashboardCharts;