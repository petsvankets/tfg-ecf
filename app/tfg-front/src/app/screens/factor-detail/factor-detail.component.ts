import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {
  CfkgService,
  FactorDetail,
  FactorTimeseries,
  FactorSeriesPoint,
} from '../../services/cfkg.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-factor-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    BaseChartDirective, // 👈 gráfico
  ],
  templateUrl: './factor-detail.component.html',
  styleUrls: ['./factor-detail.component.scss'],
})
export class FactorDetailComponent {
  private cfkg = inject(CfkgService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  // Estado básico
  factorId = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  factor = signal<FactorDetail | null>(null);
  timeseries = signal<FactorTimeseries | null>(null);

  // Datos de la gráfica
  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Year' },
      },
      y: {
        title: { display: true, text: 'Factor value' },
      },
    },
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  constructor() {
    const id = decodeURIComponent(
      this.route.snapshot.paramMap.get('id') || ''
    );
    this.factorId.set(id);
    this.loadData();
  }

  goBack(): void {
    this.location.back();
  }

  private loadData() {
    const id = this.factorId();
    this.loading.set(true);
    this.error.set(null);

    // Detalle del factor (LDKit + resolver)
    this.cfkg.getFactorDetail(id).subscribe({
      next: (detail: FactorDetail) => {
        this.factor.set(detail);
        this.loading.set(false);
        // El nombre fiable llega aquí; refrescar la gráfica si la serie ya cargó.
        this.updateChart();
      },
      error: (e) => {
        console.error(e);
        this.error.set(e?.message || 'Error cargando el factor');
        this.loading.set(false);
      },
    });

    // Serie temporal
    this.cfkg.getFactorTimeseries(id).subscribe({
      next: (ts: FactorTimeseries) => {
        this.timeseries.set(ts);
        this.updateChart();
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  private updateChart() {
    const ts = this.timeseries();
    if (!ts || !ts.series.length) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    const labels = ts.series.map((p: FactorSeriesPoint) =>
      p.year.toString()
    );
    const data = ts.series.map((p: FactorSeriesPoint) => p.value);

    // El nombre del detalle (LDKit) es el fiable; la etiqueta de la serie puede
    // faltar y llegar como marcador. Se ignoran los marcadores tipo "(sin título)".
    const isPlaceholder = (s?: string | null) =>
      !s || !s.trim() || s.trim() === '(sin título)';
    const detailName = this.factor()?.name;
    const factorName = !isPlaceholder(detailName)
      ? (detailName as string).trim()
      : !isPlaceholder(ts.name)
        ? ts.name.trim()
        : 'Emission factor';

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label: factorName,
          fill: false,
          tension: 0.2,
          pointRadius: 3,
        },
      ],
    };

    // Identificar el factor en el título de la gráfica (comentario 28 del tutor).
    this.lineChartOptions = {
      ...this.lineChartOptions,
      plugins: {
        ...this.lineChartOptions?.plugins,
        title: {
          display: true,
          text: `Historical evolution — ${factorName}`,
        },
      },
    };
  }

  extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  formatUnit(unit: string, value: number, targetGas: string): string {
    if (!unit) return 'Unknown unit';

    // Dividir por '/' o '→' para obtener numerador y denominador
    const parts = unit.split(/[\/→]/);

    if (parts.length === 2) {
      // Detectar el separador usado
      const separator = unit.includes('→') ? '→' : '/';

      let activityUnit: string;
      let resultUnit: string;

      if (separator === '→') {
        // "mile → kilogram" significa: 1 mile produce X kilogram
        activityUnit = parts[0].trim();
        resultUnit = parts[1].trim();
      } else {
        // "kilogram/mile" significa: X kilogram por 1 mile
        resultUnit = parts[0].trim();
        activityUnit = parts[1].trim();
      }

      // Formato: "1 mile produces 0.713 kilogram of carbon dioxide"
      return `1 ${activityUnit} produces ${this.formatValue(value)} ${resultUnit} of ${targetGas}`;
    }

    return unit;
  }

  /**
   * Formatea el valor numérico sin ceros decimales superfluos.
   * Corrige el comentario 27 del tutor: 75,3 no debe mostrarse como "75.300".
   */
  formatValue(value: number): string {
    if (value == null || !Number.isFinite(value)) return String(value ?? '');
    return parseFloat(value.toFixed(6)).toString();
  }

  /**
   * Traduce el IRI de alcance (scope) a una etiqueta legible.
   * Corrige el comentario 27 del tutor: el scope no debe mostrarse como IRI.
   */
  humanScope(scopeIri?: string): string {
    if (!scopeIri) return 'Not specified';
    const key = scopeIri.split('#').pop()?.split('/').pop() ?? '';
    switch (key) {
      case 'Scope1':
        return 'Scope 1 (direct emissions)';
      case 'Scope2':
        return 'Scope 2 (indirect emissions, energy)';
      case 'Scope3':
        return 'Scope 3 (other indirect emissions)';
      default:
        return key || 'Not specified';
    }
  }
}
