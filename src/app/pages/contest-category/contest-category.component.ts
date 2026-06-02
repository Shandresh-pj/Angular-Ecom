import { Component } from '@angular/core';
import { CategoryComponent } from '../category/category.component';

@Component({
  selector: 'app-contest-category',
  standalone: true,
  imports: [CategoryComponent],
  templateUrl: './contest-category.component.html',
  styleUrl: './contest-category.component.scss'
})
export class ContestCategoryComponent {

}
