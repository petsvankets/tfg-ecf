import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CfkgService, CfkgItem } from '../../services/cfkg.service';

@Component({
  selector: 'app-factors-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factors-search.component.html',
  styleUrls: ['./factors-search.component.scss']
})
export class FactorsSearchComponent {
  private svc = inject(CfkgService);

  text = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<CfkgItem[]>([]);

  onSubmit(ev: Event) {
    ev.preventDefault();
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.searchFactors(this.text()).subscribe({
      next: (rows) => { this.items.set(rows); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message || 'Error consultando CFKG'); this.loading.set(false); }
    });
  }

  openIri(it: CfkgItem) {
    if (it.id) window.open(it.id, '_blank');
  }
}
