import { Component } from '@angular/core';
import { InvestigationService } from '../services/investigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investigation',
  templateUrl: './investigation.component.html',
    imports: [CommonModule],
  styleUrls: ['./investigation.component.scss']
})
export class InvestigationComponent {

  constructor(
    public investigation: InvestigationService
  ) {}
}