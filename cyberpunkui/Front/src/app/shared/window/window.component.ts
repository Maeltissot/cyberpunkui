import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import {
  AppWindow,
  WindowManagerService
} from '../../services/window-manager.service';
import { CommonModule } from '@angular/common';
import { GlitchHackComponent } from '../../minigames/glitch-hack/glitch-hack.component';
import { FileNode } from '../../models/file-node.model';
import { DecryptPuzzleComponent } from '../../minigames/decrypt-puzzle/decrypt-puzzle.component';
import { NetworkHackComponent } from '../../minigames/network-puzzle/network-puzzle.component';
import { TerminalComponent } from '../../terminal/terminal.component';
import { ShardHackComponent } from '../../minigames/shard-hack/shard-hack.component';

@Component({
  selector: 'app-window',
  imports: [CommonModule,CdkDrag,GlitchHackComponent,DecryptPuzzleComponent,NetworkHackComponent, TerminalComponent, ShardHackComponent],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  standalone: true
})
export class WindowComponent {

  @Input() window!: AppWindow;

  constructor(
    private windowManager: WindowManagerService
  ) {}
  openChild(child: FileNode) {
    this.windowManager.open(child);
  }

  unlockFolder() {
    this.window.file.type = 'folder';
  }

  close() {
    this.windowManager.close(this.window.id);
  }
}
