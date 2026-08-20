import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';  // ✅ Toast import

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],  // ✅ Toast add
  templateUrl: './app.html',       // ✅ .html
  styleUrl: './app.scss'          // ✅ .scss
})
export class App {
  title = 'EmpPro Manager';
}