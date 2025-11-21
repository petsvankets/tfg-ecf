import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CfkgService, FactorItem } from '../../services/cfkg.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-factors-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './factors-search.component.html',
  styleUrls: ['./factors-search.component.scss']
})
export class FactorsSearchComponent {
  private svc = inject(CfkgService);

  text = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<FactorItem[]>([]);

  onSubmit(ev: Event) {
    ev.preventDefault();
    this.fetch();
  }

  fetch() {
    const query = this.text().trim();
    if (!query) {
      this.items.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.svc.searchFactors(query).subscribe({
      next: (rows) => { this.items.set(rows); this.loading.set(false); },
      error: (e) => {
        this.error.set(e?.message || 'Error consultando CFKG');
        this.loading.set(false);
      }
    });
  }

  openIri(it: FactorItem) {
    if (it.id) window.open(it.id, '_blank');
  }

  encodeId(it: FactorItem) {
    return encodeURIComponent(it.id);
  }
}
