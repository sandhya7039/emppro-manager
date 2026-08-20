import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  showSuccess(message: string): void {
    console.log('✅ Toast Success:', message); // Debug
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.style.background = '#22c55e';
        toast.style.color = 'white';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.fontSize = '14px';
        toast.style.padding = '12px 20px';
        toast.style.minWidth = '200px';
        toast.style.border = 'none';
        toast.style.fontWeight = '500';
      }
    });
    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  showError(message: string): void {
    console.log('❌ Toast Error:', message); // Debug
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.style.background = '#ef4444';
        toast.style.color = 'white';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.fontSize = '14px';
        toast.style.padding = '12px 20px';
        toast.style.minWidth = '200px';
        toast.style.border = 'none';
        toast.style.fontWeight = '500';
      }
    });
    Toast.fire({
      icon: 'error',
      title: message
    });
  }

  showWarning(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.style.background = '#f59e0b';
        toast.style.color = 'white';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.fontSize = '14px';
        toast.style.padding = '12px 20px';
        toast.style.minWidth = '200px';
        toast.style.border = 'none';
        toast.style.fontWeight = '500';
      }
    });
    Toast.fire({
      icon: 'warning',
      title: message
    });
  }

  showInfo(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.style.background = '#667eea';
        toast.style.color = 'white';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.fontSize = '14px';
        toast.style.padding = '12px 20px';
        toast.style.minWidth = '200px';
        toast.style.border = 'none';
        toast.style.fontWeight = '500';
      }
    });
    Toast.fire({
      icon: 'info',
      title: message
    });
  }
}