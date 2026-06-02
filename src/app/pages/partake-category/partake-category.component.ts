import { Component } from '@angular/core';
import { CategoryComponent } from '../category/category.component';

@Component({
  selector: 'app-partake-category',
  standalone: true,
  imports: [CategoryComponent],
  templateUrl: './partake-category.component.html',
  styleUrl: './partake-category.component.scss'
})
export class PartakeCategoryComponent {

}
