import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';

export interface SendOtpRequest {
    email: string;
}

export interface SendOtpResponse {
    success: boolean;
    message: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    reset_token: string;
}

export interface ResetPasswordRequest {
    reset_token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

@Injectable({
    providedIn: 'root',
})
export class PasswordService {
    constructor(private commonService: CommonService) {}

    public sendOtp(payload: SendOtpRequest): Observable<SendOtpResponse> {
        return this.commonService.postApi('password/send-otp', payload) as Observable<SendOtpResponse>;
    }

    public verifyOtp(payload: VerifyOtpRequest): Observable<VerifyOtpResponse> {
        return this.commonService.postApi('password/verify-otp', payload) as Observable<VerifyOtpResponse>;
    }

    public resetPassword(payload: ResetPasswordRequest): Observable<ResetPasswordResponse> {
        return this.commonService.postApi('password/reset', payload) as Observable<ResetPasswordResponse>;
    }

    public changePassword(payload: ChangePasswordRequest): Observable<ChangePasswordResponse> {
        return this.commonService.postApi('password/change', payload) as Observable<ChangePasswordResponse>;
    }
}
