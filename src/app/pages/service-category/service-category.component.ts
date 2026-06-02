import { Component } from '@angular/core';
import { CategoryComponent } from '../category/category.component';

@Component({
    selector: 'app-service-category',
    standalone: true,
    imports: [CategoryComponent],
    templateUrl: './service-category.component.html',
    styleUrl: './service-category.component.scss',
})
export class ServiceCategoryComponent {}