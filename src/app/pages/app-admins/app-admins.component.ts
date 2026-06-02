import { Component } from '@angular/core';
import { UsersComponent } from '../users/users.component';

@Component({
  selector: 'app-app-admins',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './app-admins.component.html',
  styleUrl: './app-admins.component.scss',
})
export class AppAdminsComponent {}