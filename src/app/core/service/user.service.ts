import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ResourcesService } from './routes.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private authService: AuthService,
    private resoucesService: ResourcesService,
      private router: Router
  ) {}

  private profileUpdated = new Subject<void>();
  profileUpdated$ = this.profileUpdated.asObservable();
  notifyProfileUpdated() {
    this.profileUpdated.next();
  }
  private CurrentCompanyType:string='';
  private userResources: any = [];
  private resourceActionCache: any = null;
  private isRootAdmin: boolean = false;
  private getResourceAction() {
    if (!this.resourceActionCache) {
      this.resourceActionCache = this.buildResourceAction();
    }
    return this.resourceActionCache;
  }
  private checkRoot(){
    const user = this.authService.fetchUserDetails(); 
    this.isRootAdmin = user?.IsChinTamAdmin === true ;
  }

  private buildResourceAction() {
    const user = this.authService.fetchUserDetails(); 
    const userAccess = this.authService.getUserAccess(this.CurrentCompanyType) || {};
    const WebResources = this.resoucesService.Resources;
    const Actions = this.resoucesService.Actions;
    const resourceAction: any = {};
    this.isRootAdmin = user?.UserType=="RootUser";
    // Only build resourceAction if the user is not an admin1
    if (user?.UserType!="RootUser") {
      function processResource(wr: any) {
        let resourceName = wr.ResourceName.toLowerCase();
        if (userAccess[wr.Id]) {
          if (!resourceAction[resourceName])
            resourceAction[resourceName] = { ...wr, Actions: [] };
          Actions.forEach((action: any) => {
            if (userAccess[wr.Id].includes(action.Id)) {
              resourceAction[resourceName]['Actions'].push(action);
            }
          });
        }
        if (wr.children && Array.isArray(wr.children)) {
          wr.children.forEach((child: any) => processResource(child));
        }
      }
      WebResources.forEach((wr: any) => processResource(wr));
    }
    return resourceAction;
  }

  hasPermission(Action: string): boolean {
    this.checkRoot();
    if (this.isRootAdmin) return true;
    if (!Action) Action = '';
    let userAccess = this.authService.getUserAccess(this.CurrentCompanyType);
    let urlNoQuery=this.router.url && this.router.url.split("?")[0]
    let user = this.authService.fetchUserDetails();
    if (user?.UserType=="RootUser") {
      return true;
    }
    if(Object.keys(userAccess).length>0){
    return  Object.keys(userAccess).some((uaKey:string)=>{ return userAccess[uaKey].Url===urlNoQuery && userAccess[uaKey]?.Actions?.includes(Action)
       // let obj=userAccess[uaKey];
        
      })
    }
   // const resourceAction = this.getResourceAction();

    // if (
    //   resourceAction[Resource] &&
    //   Array.isArray(resourceAction[Resource]['Actions'])
    // ) {
    //   // console.log("...",Action,resourceAction[Resource]['Actions'],resourceAction[Resource]['Actions'].some(
    //   //   (action: any) =>
    //   //     action.ActionName.toLowerCase() === Action.toLowerCase()))
    //   return resourceAction[Resource]['Actions'].some(
    //     (action: any) =>
    //       action.ActionName.toLowerCase() === Action.toLowerCase()
    //   );
    // }
    return false;
  }

  hasPagePermission(ResourceUrl: string): boolean {
    this.checkRoot();
    if (this.isRootAdmin) return true;   
    if (ResourceUrl === '/report') return true;
    if (this.userResources.length === 0) {
      // const user = this.authService.fetchUserDetails();
      // const companyType = user?.Companys?.CompanyType?.toUpperCase();
      // this.getUserResources(companyType);
      this.userResources = this.resoucesService.Resources || [];
    }
    let userAccessPage=this.userResources.some((ur:any)=>ur.ResourceUrl===ResourceUrl);
    console.log('checkresources',userAccessPage)
    return userAccessPage;
  }

  getUserResources(CompanyType:string) {
    this.CurrentCompanyType=CompanyType;
    let user = this.authService.fetchUserDetails();
    // let userAccess = user?.RoleAccess?.[CompanyType] ?? [];
   let userAccess = user?.UserAccess ?? {};
    if (this.userResources.length>0 && userAccess.length==this.userResources.length) {
      return this.userResources;
    }
    
    //this.authService.getUserAccess();
    let WebResources = this.resoucesService.Resources;
    let resourceAction: any = {};
    this.userResources = WebResources;
    if (user?.UserType!="RootUser") {
      function processResource(wr: any, parentId: any) {
        if (userAccess[wr.Id]) {
          // Initialize the resource if it hasn't been added yet
          if (wr.children && Array.isArray(wr.children)) {
            let children = wr.children.filter((wrChild: any) => {
              return Object.keys(userAccess).some(function (ua: any) {
                return wrChild.Id == ua;
              });
            });
            wr['children'] = children;
          }
          if (!resourceAction[wr.Id] && !resourceAction[parentId])
            resourceAction[wr.Id] = { ...wr };
        }
        // Recursively process child resources if they exist
        if (wr.children && Array.isArray(wr.children)) {
          wr.children.forEach((child: any) => processResource(child, wr.Id));
        }
      }
      WebResources.forEach((wr: any) => processResource(wr, 0));
      this.userResources = Object.values(resourceAction);
    }
    return this.userResources;
  }
}
