import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/user-dashboard/user-dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'admin/match',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/match-management/match-management.component').then(
            (m) => m.MatchManagementComponent,
          ),
      },
      {
        path: 'players',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/players/player-list/player-list.component').then(
                (m) => m.PlayerListComponent,
              ),
          },
          {
            path: 'manage',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/players/player-form/player-form.component').then(
                (m) => m.PlayerFormComponent,
              ),
          },
          {
            path: 'manage/:id',
            canActivate: [adminGuard],
            loadComponent: () =>
              import('./features/players/player-form/player-form.component').then(
                (m) => m.PlayerFormComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/players/player-detail/player-detail.component').then(
                (m) => m.PlayerDetailComponent,
              ),
          },
        ],
      },
      {
        path: 'sunday-match',
        loadComponent: () =>
          import('./features/availability/sunday-match/sunday-match.component').then(
            (m) => m.SundayMatchComponent,
          ),
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/teams/team-generator/team-generator.component').then(
            (m) => m.TeamGeneratorComponent,
          ),
      },
      {
        path: 'match-history',
        loadComponent: () =>
          import('./features/match-history/match-history-list/match-history-list.component').then(
            (m) => m.MatchHistoryListComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile-settings/profile-settings.component').then(
            (m) => m.ProfileSettingsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];