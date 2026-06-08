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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
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
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
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


pageSize = 10;
pageIndex = 0;
total = signal<number>(0);



detailColumns = ['expandedDetail'];


  searchTerm = '';
  gas = 'CO2';

  items: FactorGroup[] = [];
  loading = signal<boolean>(true);


  columns = ['name', 'unit', 'country', 'scope', 'gas','detail'];


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

  const offset = this.pageIndex * this.pageSize;

  console.log('[SEARCH]', {
    q: this.searchTerm,
    gas: this.gas,
    page: this.pageIndex,
    size: this.pageSize
  });

  this.svc.searchFactors(
    this.searchTerm,
    this.gas as any,
    this.pageSize,
    offset
  ).subscribe({
    next: rows => {
      this.items = rows;
      this.loading.set(false);
    },
    error: err => {
      console.error(err);
      this.items = [];
      this.loading.set(false);
    }
  });

  // 👇 en paralelo: total
  this.svc.countFactorGroups(
    this.searchTerm,
    this.gas as any
  ).subscribe(total => {
    this.total.set(total);
  });
}

onPageChange(event: any): void {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;

  // cerrar expansiones al cambiar de página (UX correcto)
  this.expanded.clear();
  this.variants = {};

  this.search();
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

// ================== HUMAN READABLE HELPERS ==================

humanScope(scopeIri?: string): string {
  if (!scopeIri) return 'Not specified';

  const key = scopeIri.split('#').pop();
  switch (key) {
    case 'Scope1':
      return 'Direct emissions';
    case 'Scope2':
      return 'Indirect emissions (energy)';
    case 'Scope3':
      return 'Other indirect emissions';
    default:
      return 'Not specified';
  }
}

humanContext(context?: string): string {
  if (!context) return 'Standard conditions';

  const c = context.toLowerCase();
  if (c.includes('0%')) return 'No load';
  if (c.includes('50%')) return 'Half load';
  if (c.includes('100%')) return 'Full load';
  if (c.includes('average')) return 'Average load';

  return context;
}

humanGas(gas: string): string {
  switch (gas) {
    case 'CO2':
      return 'Carbon dioxide (CO₂)';
    case 'CO2e':
      return 'CO₂ equivalent';
    case 'CH4':
      return 'Methane (CH₄)';
    case 'N2O':
      return 'Nitrous oxide (N₂O)';
    default:
      return gas;
  }
}

getShortIri(iri: string): string {
  if (!iri) return '';

  // Extraer la última parte del IRI después del último / o #
  const parts = iri.split(/[/#]/);
  const lastPart = parts[parts.length - 1];

  // Si es muy largo, mostrar solo los últimos caracteres
  if (lastPart.length > 40) {
    return '...' + lastPart.slice(-40);
  }

  return lastPart;
}



}

