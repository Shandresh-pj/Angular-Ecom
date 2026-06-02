import { Component } from '@angular/core';
import { UsersComponent } from '../users/users.component';

@Component({
  selector: 'app-reseller',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './reseller.component.html',
  styleUrl: './reseller.component.scss',
})
export class ResellerComponent {}