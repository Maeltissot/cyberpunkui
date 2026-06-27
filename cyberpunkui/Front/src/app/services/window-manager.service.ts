import { Injectable, signal } from '@angular/core';
import { FileNode } from '../models/file-node.model';

export interface AppWindow {
  id: string;
  title: string;
  file: FileNode;
}

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {

  windows = signal<AppWindow[]>([]);

  open(file: FileNode) {

    const exists = this.windows().find(w => w.id === file.id);

    if (exists) {
      return;
    }

    this.windows.update(windows => [
      ...windows,
      {
        id: file.id,
        title: file.name,
        file
      }
    ]);
  }

  close(id: string) {
    this.windows.update(windows =>
      windows.filter(w => w.id !== id)
    );
  }
}