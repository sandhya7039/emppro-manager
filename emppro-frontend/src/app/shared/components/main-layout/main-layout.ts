import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar'; // 👈 Sidebar import

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, SidebarComponent], // 👈 Yahan add karo
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {}