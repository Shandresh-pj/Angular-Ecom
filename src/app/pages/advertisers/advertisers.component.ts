import { Component } from '@angular/core';
import { UsersComponent } from '../users/users.component';

@Component({
  selector: 'app-advertisers',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './advertisers.component.html',
  styleUrl: './advertisers.component.scss',
})
export class AdvertisersComponent {}