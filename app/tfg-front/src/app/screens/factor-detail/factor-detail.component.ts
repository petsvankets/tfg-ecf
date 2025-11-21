import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CfkgService,
  FactorDetail,
  FactorSeriesPoint,
} from '../../services/cfkg.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-factor-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    MatProgressBarModule,
    MatButtonModule,
  ],
  templateUrl: './factor-detail.component.html',
  styleUrls: ['./factor-detail.component.scss'],
})
export class FactorDetailComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(CfkgService);

  factorId = signal<string>('');
  detail = signal<FactorDetail | null>(null);
  series = signal<FactorSeriesPoint[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  seriesColumns: string[] = ['year', 'value'];

  constructor() {
    const encoded = this.route.snapshot.paramMap.get('id') ?? '';
    const decoded = decodeURIComponent(encoded);
    this.factorId.set(decoded);

    this.load(decoded);
  }

  private load(id: string) {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      detail: this.svc.getFactorDetail(id),
      timeseries: this.svc.getFactorTimeseries(id),
    }).subscribe({
      next: ({ detail, timeseries }) => {
        this.detail.set(detail);
        this.series.set(timeseries.series);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.message || 'Error obteniendo detalle del factor');
        this.loading.set(false);
      },
    });
  }
}
