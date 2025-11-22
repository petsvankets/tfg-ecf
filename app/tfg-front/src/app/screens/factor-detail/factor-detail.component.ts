import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-factor-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    BaseChartDirective, // 👈 gráfico
  ],
  templateUrl: './factor-detail.component.html',
  styleUrls: ['./factor-detail.component.scss'],
})
export class FactorDetailComponent {
  private cfkg = inject(CfkgService);
  private route = inject(ActivatedRoute);

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
        title: { display: true, text: 'Año' },
      },
      y: {
        title: { display: true, text: 'Valor del factor' },
      },
    },
    plugins: {
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

  private loadData() {
    const id = this.factorId();
    this.loading.set(true);
    this.error.set(null);

    // Detalle del factor (LDKit + resolver)
    this.cfkg.getFactorDetail(id).subscribe({
      next: (detail: FactorDetail) => {
        this.factor.set(detail);
        this.loading.set(false);
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
        this.updateChart(ts);
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  private updateChart(ts: FactorTimeseries) {
    if (!ts || !ts.series.length) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    const labels = ts.series.map((p: FactorSeriesPoint) =>
      p.year.toString()
    );
    const data = ts.series.map((p: FactorSeriesPoint) => p.value);

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Factor de emisión',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
        },
      ],
    };
  }

  backToSearch() {
    // Si tienes routerLink en el HTML para volver, esto igual ni lo usas.
  }
}
