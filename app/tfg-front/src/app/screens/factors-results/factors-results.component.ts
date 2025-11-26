import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { CfkgService, FactorItem } from '../../services/cfkg.service';

@Component({
  selector: 'app-factors-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
  ],
  templateUrl: './factors-results.component.html',
  styleUrls: ['./factors-results.component.scss'],
})
export class FactorsResultsComponent {

  private svc = inject(CfkgService);
  private route = inject(ActivatedRoute);

  searchTerm = '';
  selectedYear = '';
  selectedCategory = '';

  years = ['2016','2017','2018','2019','2020','2021','2022','2023'];

  // factores cargados
  items = signal<FactorItem[]>([]);
  filteredResults: FactorItem[] = [];

  columns = ['name', 'unit', 'country', 'year', 'detail'];

  constructor() {
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      const category = params['category'];

      if (q) this.searchTerm = q;
      if (category) this.searchTerm = category;

      if (this.searchTerm.trim()) {
        this.search();
      }
    });
  }

  loading = signal(true);


  /** Ejecuta la búsqueda en el endpoint */
  search() {
  this.loading.set(true);

  this.svc.searchFactors(this.searchTerm).subscribe(rows => {
    this.items.set(rows);
    this.filteredResults = rows;
    this.loading.set(false);
  });
}


  /** FILTROS REALES */
  applyFilters() {
    let rows = this.items();

    if (this.selectedYear) {
      rows = rows.filter(r => String(r.latestYear) === this.selectedYear);
    }

    if (this.selectedCategory) {
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }

    if (this.searchTerm) {
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredResults = rows;
  }

  encodeId(it: FactorItem) {
    return encodeURIComponent(it.id);
  }
}
