import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type Cell = {
  active: boolean;
  selected: boolean;
};

@Component({
  selector: 'app-glitch-hack',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './glitch-hack.component.html',
  styleUrls: ['./glitch-hack.component.scss']
})
export class GlitchHackComponent implements OnInit {

  size = 5;
  grid: Cell[][] = [];

  trace = 0;
  maxTrace = 100;

  showingPattern = true;
  message = 'MEMORY SCAN...';

  ngOnInit() {
    this.generatePattern();
    this.showPatternBriefly();
  }

  generatePattern() {
    this.grid = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({
        active: Math.random() < 0.25,
        selected: false
      }))
    );
  }

  showPatternBriefly() {
    this.showingPattern = true;

    setTimeout(() => {
      this.showingPattern = false;
      this.message = 'RECONSTRUCT SIGNAL';
    }, 2000);
  }

  toggleCell(i: number, j: number) {
    const cell = this.grid[i][j];

    cell.selected = !cell.selected;

    if (cell.selected && !cell.active) {
      this.trace += 10;
      this.glitch();
    }

    this.checkWin();
  }

  checkWin() {
    const win = this.grid.every(row =>
      row.every(c =>
        (c.active && c.selected) ||
        (!c.active && !c.selected)
      )
    );

    if (win) {
      this.message = 'ACCESS GRANTED';
    }
  }

  glitch() {
    document.body.classList.add('glitch-hit');

    setTimeout(() => {
      document.body.classList.remove('glitch-hit');
    }, 120);
  }
}