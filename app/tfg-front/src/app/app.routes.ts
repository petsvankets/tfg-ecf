import { Routes } from '@angular/router';
import { FactorsSearchComponent } from './screens/factors-search/factors-search.component';

export const routes: Routes = [
  { path: '', component: FactorsSearchComponent },
  { path: '**', redirectTo: '' }
];
