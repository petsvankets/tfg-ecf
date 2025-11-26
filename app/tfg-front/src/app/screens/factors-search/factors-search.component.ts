import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-factors-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './factors-search.component.html',
  styleUrls: ['./factors-search.component.scss'],
})
export class FactorsSearchComponent {
  private router = inject(Router);

  query = signal('');

  categories = [
    { label: 'Vehículos pesados (HGV)', tag: 'hgv', icon: 'local_shipping' },
    { label: 'Vehículos ligeros / Delivery', tag: 'delivery', icon: 'airport_shuttle' },
    { label: 'Vehículos (artics)', tag: 'artics', icon: 'local_shipping' },
    { label: 'Electricidad', tag: 'electricity', icon: 'bolt' },
    { label: 'Combustibles gaseosos', tag: 'propane', icon: 'gas_meter' },
    { label: 'Diesel y derivados', tag: 'diesel', icon: 'local_gas_station' },
  ];

  onSubmit(ev: Event) {
    ev.preventDefault();
    const q = this.query().trim();
    if (!q) return;

    this.router.navigate(['/search'], {
      queryParams: { q }
    });
  }

  searchCategory(tag: string) {
    this.router.navigate(['/search'], {
      queryParams: { category: tag }
    });
  }
}
