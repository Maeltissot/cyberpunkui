import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type NodeType =
  | 'start'
  | 'normal'
  | 'firewall'
  | 'target';

interface NetNode {
  id: number;
  x: number;
  y: number;
  type: NodeType;
  connectedTo: number[];
  active: boolean;
}

@Component({
  selector: 'app-network-hack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-puzzle.component.html',
  styleUrls: ['./network-puzzle.component.scss']
})
export class NetworkHackComponent {

  trace = 0;
  maxTrace = 100;

  message = 'ROUTE SIGNAL';

  currentNode = 0;

  nodes: NetNode[] = [
    {
      id: 0,
      x: 50,
      y: 200,
      type: 'start',
      connectedTo: [1, 2],
      active: true
    },

    {
      id: 1,
      x: 220,
      y: 100,
      type: 'normal',
      connectedTo: [3],
      active: false
    },

    {
      id: 2,
      x: 220,
      y: 300,
      type: 'firewall',
      connectedTo: [3],
      active: false
    },

    {
      id: 3,
      x: 420,
      y: 200,
      type: 'target',
      connectedTo: [2],
      active: false
    }
  ];

  clickNode(node: NetNode) {

    const current =
      this.nodes.find(n => n.id === this.currentNode);

    if (!current) return;

    // invalid route
    if (!current.connectedTo.includes(node.id)) {

      this.trace += 15;
      this.message = 'INVALID ROUTE';

      this.glitch();

      return;
    }

    // activate
    node.active = true;

    this.currentNode = node.id;

    // firewall penalty
    if (node.type === 'firewall') {

      this.trace += 25;

      this.message = 'ICE DETECTED';

      this.glitch();
    }

    // win
    if (node.type === 'target') {
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