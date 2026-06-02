import { Component, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatCard } from '@angular/material/card';
import { CommonService } from '../../core/service/common.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCard],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  extends Utils implements OnInit {
  isToggled: any;
  dashboardData: any = {
    Dealers: { total: 0, lastWeek: 0 },
    Resellers: { total: 0, lastWeek: 0 },
    Students: { total: 0, lastWeek: 0 },
    Videos: { total: 0, lastWeek: 0 },
    Products: { total: 0, lastWeek: 0 }
  };
  constructor(
            public themeService: CustomizerSettingsService,
                          private commonService: CommonService,
             ) {
              super();

               this.themeService.isToggled$.subscribe((isToggled) => {
              this.isToggled = isToggled;
          });
             }

             ngOnInit(): void {
              this.getDashboardCounts();
            }
          
            getDashboardCounts() {
              this.commonService.getApi('User/dashboard-counts').subscribe({
                next: (res: any) => {
                  this.dashboardData = { ...this.dashboardData, ...res };
                },
                error: (err: any) => {
                  console.error(err);
                }
              });
            }

}
