import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './desktop/desktop.component';
import { TerminalComponent } from './terminal/terminal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet,DesktopComponent,TerminalComponent,CommonModule],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  terminalOpen = signal(true);

  hackMode = signal(false); // 👈 FULLSCREEN HACK MODE
}