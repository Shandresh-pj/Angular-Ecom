import { Component } from '@angular/core';
import { UsersComponent } from '../users/users.component';

@Component({
  selector: 'app-dealer',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './dealer.component.html',
  styleUrl: './dealer.component.scss',
})
export class DealerComponent {}