import { Component } from '@angular/core';
// import { routes } from '../app.routes';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { IgxTimePickerComponent, IgxPickerToggleComponent, IgxPrefixDirective, IgxIconComponent, IgxHintDirective, IgxButtonDirective } from 'igniteui-angular';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [RouterModule,IgxTimePickerComponent, FormsModule, 
    IgxPickerToggleComponent, 
    IgxPrefixDirective, 
    IgxIconComponent, 
    IgxHintDirective,
    IgxButtonDirective],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent {
  public today: Date = new Date();

  public selectNow(timePicker: IgxTimePickerComponent) {
      timePicker.value = new Date();
      timePicker.close();
  }
}
