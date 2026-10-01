import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/search-page/search-page.component').then(
        (component) => component.SearchPageComponent,
      ),
  },
  {
    path: 'card/:id',
    loadComponent: () =>
      import('./components/card-page/card-page.component').then(
        (component) => component.CardPageComponent,
      ),
  },
  {
    path: 'blue-eyes',
    loadComponent: () =>
      import('./components/blue-eyes/blue-eyes.component').then(
        (component) => component.BlueEyesComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
