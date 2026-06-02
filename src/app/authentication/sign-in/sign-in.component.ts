import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../../utils';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { ResourcesService } from '../../core/service/routes.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatCheckbox],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class SignInComponent extends Utils {
  classApplied = false;
  userDetails: any;
  public LoginForm: FormGroup;
  hide = true;
  alwaysChecked: boolean = true;
  isToggled = false;

  constructor(
      public themeService: CustomizerSettingsService,
      private formBuilder: FormBuilder,
      private commonService: CommonService,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,
      private resourceService: ResourcesService
  ) {
      super();
      this.LoginForm = this.formBuilder.group({
        Email: ['', [Validators.required, Validators.email]],
        Password: ['', Validators.required],
      });

      this.themeService.isToggled$.subscribe(isToggled => {
        this.isToggled = isToggled;
      });
  }

  onSubmit(form: FormGroup) {
    console.log('res', form.value);
    this.classApplied = false;

    if (!form.valid) {
      this.validateAllFormFields(form);
      return;
    }

    const email = form.value.Email;
    const password = form.value.Password;

    if (!email || !password) {
      this.errorAlert('Please enter Email and Password');
      return;
    }

    const payload = {
      email: email,
      password: password,
      usertype: 'superadmin',
    // CompanyCode: 'ChinTam'
    };

    console.log('payload', payload);

    this.commonService.postApi('login', payload).subscribe(
      (res: any) => {
        if (res?.status === 200 || res?.success === true) {
          console.log('Login success', res);
          const userDetails = res['response'] || res['data'] || res;
          this.authService.storeUserDetails(userDetails);
          this.resourceService.getResources().then((resources) => {
            console.log('Resources reloaded after login:', resources);
            this.router.navigate(['/dashboard']);
          });
        } else {
          this.errorAlert(res?.message || 'Login failed');
        }
      },
      (error: any) => {
        this.errorAlert(error);
      }
    );
  }
}
