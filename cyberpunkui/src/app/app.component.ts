import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DesktopComponent } from './desktop/desktop.component';
import { TerminalComponent } from './terminal/terminal.component';
import { GameStateService } from './services/game-state.service';
import { CyberspaceComponent } from './cyberspace/cyberspace.component';
import { ChatBoardComponent } from './chat-board/chat-board.component';
import { InvestigationComponent } from './investigation/investigation.component';
import { WordleModalComponent } from './minigames/wordle-counterattack/wordle-counterattack.component';
import { IntrusionService } from './services/intrusion.service';
import { GhostMessageComponent } from './ghost-message/ghost-message.component';
import { GhostMessageService } from './services/message.service';
import { CameraNetworkService } from './services/camera-network.service';
import { CameraNetworkComponent } from './minigames/camera-network/camera-network.component';
import { TraceFirewallChaseComponent } from './minigames/trace-firewall-chase/trace-firewall-chase.component';
import { SocialEngineeringHackComponent } from './minigames/social-engineering-hack/social-engineering-hack.component';
import { DaemonSlotSequencerComponent } from './minigames/daemon-slot-sequencer/daemon-slot-sequencer.component';
import { DroneHijackComponent } from './minigames/drone-hijack/drone-hijack.component';
import { ImplantCalibrationComponent } from './minigames/implant-calibration/implant-calibration.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet,
    InvestigationComponent,
    DesktopComponent,
    TerminalComponent,
    CommonModule,
    WordleModalComponent,
    CyberspaceComponent,
    ChatBoardComponent,
    GhostMessageComponent,
    CameraNetworkComponent,
    DroneHijackComponent,
    ImplantCalibrationComponent,
    TraceFirewallChaseComponent,
    SocialEngineeringHackComponent,
    DaemonSlotSequencerComponent],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public router: Router,
    public game: GameStateService,
    public intrusion: IntrusionService,
    public ghost: GhostMessageService,
    public cameraNetwork: CameraNetworkService
  ) { }
  terminalOpen = signal(true);

  hackMode = signal(false); // 👈 FULLSCREEN HACK MODE
  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }
}
