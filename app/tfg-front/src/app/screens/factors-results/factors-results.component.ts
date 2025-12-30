import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CfkgService, FactorGroup } from '../../services/cfkg.service';

@Component({
  selector: 'app-factors-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './factors-results.component.html',
  styleUrls: ['./factors-results.component.scss'],
})
export class FactorsResultsComponent {

  private svc = inject(CfkgService);
  private route = inject(ActivatedRoute);

//EXPANSION PANEL
  expanded = new Set<string>();
variants: Record<string, any[]> = {};
loadingVariants = signal<Record<string, boolean>>({});


detailColumns = ['expandedDetail'];


  searchTerm = '';
  gas = 'CO2';

  items: FactorGroup[] = [];
  loading = signal<boolean>(true);


  columns = ['name', 'unit', 'country', 'scope', 'context', 'gas','detail'];


  constructor() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] ?? '';
      this.gas = params['gas'] ?? 'CO2';

      if (this.searchTerm) {
        this.search();
      }
    });
  }

  search(): void {
    this.loading.set(true);

    console.log('[SEARCH]', { q: this.searchTerm, gas: this.gas });

    this.svc.searchFactors(this.searchTerm, this.gas as any).subscribe({

  next: rows => {
    console.log('[RESULTS]', rows.length);
    this.items = rows;   // 👈 cambio clave
    this.loading.set(false);
  },
  error: err => {
    console.error(err);
    this.items = [];
    this.loading.set(false);
  }
});
  }


//EXPANSION PANEL METHODS
toggle(row: FactorGroup): void {

  if (this.expanded.has(row.key)) {
    this.expanded.delete(row.key);
    return;
  }

  this.expanded.add(row.key);

  if (!this.variants[row.key]) {
    this.variants[row.key] = [];
  }

  // 🔑 marcar loading de forma reactiva
  this.loadingVariants.update(v => ({
    ...v,
    [row.key]: true
  }));

  this.svc.expandGroup(row).subscribe({
    next: rows => {
      this.variants[row.key] = rows;

      this.loadingVariants.update(v => ({
        ...v,
        [row.key]: false
      }));
    },
    error: err => {
      console.error(err);
      this.variants[row.key] = [];

      this.loadingVariants.update(v => ({
        ...v,
        [row.key]: false
      }));
    }
  });
}


isExpanded(row: FactorGroup): boolean {
  return this.expanded.has(row.key);
}




}

