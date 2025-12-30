import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule,
  ],
  templateUrl: './factors-search.component.html',
  styleUrls: ['./factors-search.component.scss'],
})
export class FactorsSearchComponent {
  private router = inject(Router);

  query = signal('');
  gas = signal('CO2'); // 👈 gas por defecto

  gases = [
    { label: 'CO₂', value: 'CO2' },
    { label: 'CO₂e', value: 'CO2e' },
    { label: 'CH₄', value: 'CH4' },
    { label: 'N₂O', value: 'N2O' },
  ];

  categories = [
    { label: 'Heavy goods vehicles (HGV)', tag: 'hgv', icon: 'local_shipping' },
    { label: 'Light vehicles / Delivery', tag: 'delivery', icon: 'airport_shuttle' },
    { label: 'Articulated vehicles', tag: 'artics', icon: 'local_shipping' },
    { label: 'Electricity', tag: 'electricity', icon: 'bolt' },
    { label: 'Gaseous fuels', tag: 'propane', icon: 'gas_meter' },
    { label: 'Diesel and derivatives', tag: 'diesel', icon: 'local_gas_station' },
  ];

  onSubmit(ev: Event) {
    ev.preventDefault();
    const q = this.query().trim();
    if (!q) return;

    this.router.navigate(['/search'], {
      queryParams: {
        q,
        gas: this.gas(),
      }
    });
  }

  searchCategory(tag: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        q: tag,
        gas: this.gas(),
      }
    });
  }
}
