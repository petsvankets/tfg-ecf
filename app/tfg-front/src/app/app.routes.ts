import { Routes } from '@angular/router';
import { FactorsSearchComponent } from './screens/factors-search/factors-search.component';
import { FactorDetailComponent } from './screens/factor-detail/factor-detail.component';
import { FactorsResultsComponent } from './screens/factors-results/factors-results.component';


export const routes: Routes = [
  { path: '', component: FactorsSearchComponent },
  { path: 'search', component: FactorsResultsComponent },
  { path: 'factor/:id', component: FactorDetailComponent },
  { path: '**', redirectTo: '' }
];
