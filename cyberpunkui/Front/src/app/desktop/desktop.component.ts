import { Component, effect } from '@angular/core';
import { FilesystemService } from '../services/filesystem.service';
import { WindowManagerService } from '../services/window-manager.service';
import { FileNode } from '../models/file-node.model';
import { WindowComponent } from '../shared/window/window.component';
import { CommonModule } from '@angular/common';
import { CommandService } from '../services/command.service';

@Component({
  selector: 'app-desktop',
  imports: [WindowComponent,CommonModule],
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  standalone: true
})
export class DesktopComponent {

  constructor(
    public filesystem: FilesystemService,
    public windowManager: WindowManagerService,
    private terminal: CommandService
  ) {
 this.terminal.events$
    .subscribe(event => {

     
    });

  }
  open(file: FileNode) {
    this.windowManager.open(file);
  }

  ngOnInit() {
    console.log(this.filesystem.root);
  }
}