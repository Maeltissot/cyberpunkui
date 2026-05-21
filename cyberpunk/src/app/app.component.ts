import {
  Component, OnInit, AfterViewChecked,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConsoleLine {
  type: 'output' | 'input' | 'error' | 'success' | 'system' | 'ascii';
  text: string;
  timestamp?: string;
  delay?: number;
}

const ASCII_BANNER = `
 ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗      ██████╗ ███████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝     ██╔═══██╗██╔════╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗     ██║   ██║███████╗
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║     ██║   ██║╚════██║
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║     ╚██████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝      ╚═════╝ ╚══════╝`;

const COMMANDS: Record<string, (args: string[]) => ConsoleLine[]> = {
  help: () => [
    { type: 'system', text: '╔══════════════════════════════════════════════════════╗' },
    { type: 'system', text: '║           NΞXUS-OS  v4.2.1  //  COMMAND INDEX        ║' },
    { type: 'system', text: '╚══════════════════════════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'success', text: '  help          →  display this command index' },
    { type: 'success', text: '  whoami        →  display current operator profile' },
    { type: 'success', text: '  status        →  system status & diagnostics' },
    { type: 'success', text: '  scan [target] →  run network scan on target' },
    { type: 'success', text: '  hack [target] →  initiate breach protocol' },
    { type: 'success', text: '  ls            →  list accessible nodes' },
    { type: 'success', text: '  decrypt [key] →  decrypt data packet' },
    { type: 'success', text: '  ping [host]   →  ping remote host' },
    { type: 'success', text: '  matrix        →  activate matrix rain mode' },
    { type: 'success', text: '  clear         →  purge console output' },
    { type: 'success', text: '  banner        →  show NΞXUS-OS banner' },
    { type: 'output', text: '' },
  ],

  whoami: () => [
    { type: 'system', text: '── OPERATOR PROFILE ─────────────────────────────────' },
    { type: 'output', text: '  HANDLE        :  [ANONYMOUS]' },
    { type: 'output', text: '  ACCESS LEVEL  :  ████████░░  LEVEL 8 / GHOST' },
    { type: 'output', text: '  ICE BREAKER   :  v7.3 BLACKWALL EDITION' },
    { type: 'output', text: '  LOCATION      :  NIGHT CITY // SECTOR 7G' },
    { type: 'output', text: '  STATUS        :  ◉ ACTIVE  ◎ OFF-GRID' },
    { type: 'output', text: '  REPUTATION    :  ★★★★☆  NETRUNNER ELITE' },
    { type: 'output', text: '  HEAT LEVEL    :  ▓▒░░░  LOW' },
    { type: 'system', text: '─────────────────────────────────────────────────────' },
  ],

  status: () => [
    { type: 'system', text: '── SYSTEM DIAGNOSTICS ───────────────────────────────' },
    { type: 'success', text: '  [✓] NEURAL LINK         CONNECTED   @ 14.7 Gbps' },
    { type: 'success', text: '  [✓] ICE SHIELD          ACTIVE      v7.3.1' },
    { type: 'success', text: '  [✓] PROXY CHAIN         ROUTING     7 nodes' },
    { type: 'output', text: '  [~] BLACKWALL PING      NOMINAL     128ms' },
    { type: 'output', text: '  [~] MEMORY ALLOCATION   73% / 512 EB' },
    { type: 'output', text: '  [~] CPU LOAD            ████░░░░░░  41%' },
    { type: 'error',  text: '  [!] CORP TRACE          DETECTED    EVADING...' },
    { type: 'error',  text: '  [!] INTRUSION ATTEMPT   BLOCKED     12m ago' },
    { type: 'system', text: '─────────────────────────────────────────────────────' },
  ],

  ls: () => [
    { type: 'system', text: '── ACCESSIBLE NODES ─────────────────────────────────' },
    { type: 'output', text: '  drwxr--r--  [DIR]   /arasaka_mainframe   ██████ LOCKED' },
    { type: 'output', text: '  drwxr-xr-x  [DIR]   /blackmarket_v2      ██████ OPEN' },
    { type: 'output', text: '  -rwx------  [EXE]   daemon_v4.sh         ██████ ROOT' },
    { type: 'output', text: '  -rwxr--r--  [DATA]  encrypted_cache.bin  ██████ 4.2 EB' },
    { type: 'output', text: '  -rw-r--r--  [LOG]   sys_trace.log        ██████ 128 MB' },
    { type: 'success', text: '  -rwxr-xr-x  [EXE]   icebreaker_v7.3.sh  ██████ READY' },
    { type: 'system', text: '─────────────────────────────────────────────────────' },
  ],

  clear: () => [],

  banner: () => [
    { type: 'ascii', text: ASCII_BANNER },
    { type: 'system', text: '                  NΞXUS-OS  v4.2.1  //  BLACKWALL EDITION' },
    { type: 'output', text: '' },
  ],

  matrix: () => [
    { type: 'system', text: '  MATRIX RAIN PROTOCOL ACTIVATED' },
    { type: 'success', text: '  Initiating visual override...' },
  ],

  scan: (args) => {
    const target = args[0] || '192.168.0.1';
    return [
      { type: 'system', text: `── SCANNING TARGET: ${target} ──────────────────────` },
      { type: 'output', text: '  Starting port sweep...' },
      { type: 'output', text: '  PORT   STATE    SERVICE       VERSION' },
      { type: 'success', text: '  22/tcp  open    ssh           OpenSSH 8.4' },
      { type: 'success', text: '  80/tcp  open    http          nginx/1.21.0' },
      { type: 'output', text: '  443/tcp open    https         nginx/1.21.0' },
      { type: 'error',  text: '  3306/tcp open   mysql         MySQL 8.0  [VULN]' },
      { type: 'error',  text: '  [!] CVE-2023-1941 detected — SQL injection vector' },
      { type: 'system', text: `── SCAN COMPLETE: 4 open ports, 1 vulnerability ─────` },
    ];
  },

  hack: (args) => {
    const target = args[0] || 'unknown';
    return [
      { type: 'error',  text: `  [!] INITIATING BREACH PROTOCOL ON: ${target}` },
      { type: 'output', text: '  Loading ICE breaker modules...' },
      { type: 'output', text: '  Spoofing MAC address..........  ✓' },
      { type: 'output', text: '  Routing through proxies.......  ✓' },
      { type: 'output', text: '  Injecting payload.............  ✓' },
      { type: 'error',  text: '  [!] BLACK ICE DETECTED — COUNTERMEASURES ENGAGED' },
      { type: 'success', text: '  ICE neutralized. ACCESS GRANTED.' },
      { type: 'success', text: `  >> You are now inside ${target}'s system.` },
    ];
  },

  decrypt: (args) => {
    const key = args[0];
    if (!key) return [{ type: 'error', text: '  [!] usage: decrypt [key]' }];
    return [
      { type: 'output', text: `  Applying key: ${key}` },
      { type: 'output', text: '  Running AES-512 decipher...' },
      { type: 'success', text: '  DECRYPTION SUCCESSFUL' },
      { type: 'system', text: '  PAYLOAD: "The Blackwall bleeds where code meets flesh."' },
    ];
  },

  ping: (args) => {
    const host = args[0] || 'localhost';
    return [
      { type: 'output', text: `  PING ${host} 64 bytes of data` },
      { type: 'success', text: `  64 bytes from ${host}: seq=0 ttl=64 time=12.4ms` },
      { type: 'success', text: `  64 bytes from ${host}: seq=1 ttl=64 time=11.9ms` },
      { type: 'success', text: `  64 bytes from ${host}: seq=2 ttl=64 time=13.1ms` },
      { type: 'system', text: `  --- ${host} ping statistics --- 3 sent, 3 received, 0% loss` },
    ];
  },
};

const BOOT_SEQUENCE: ConsoleLine[] = [
  { type: 'system', text: '  NΞXUS-OS BIOS v2.4 — COPYRIGHT 2077 NEXUS CORP' },
  { type: 'output', text: '  Initializing hardware...', delay: 200 },
  { type: 'output', text: '  CPU: QUANTUM-X 256-core @ 4.77 THz  .............. OK', delay: 400 },
  { type: 'output', text: '  RAM: 512 Exabytes Neural-Link DDR9  .............. OK', delay: 600 },
  { type: 'output', text: '  NET: Blackwall Interface v7  ...................... OK', delay: 800 },
  { type: 'output', text: '  ICE: Shield v7.3.1 ACTIVE  ........................ OK', delay: 1000 },
  { type: 'error',  text: '  SEC: Corp surveillance detected  ........... EVADING', delay: 1200 },
  { type: 'success',text: '  PROXY: 7-node chain established  .................. OK', delay: 1500 },
  { type: 'ascii',  text: ASCII_BANNER, delay: 1800 },
  { type: 'system', text: '                  NΞXUS-OS  v4.2.1  //  BLACKWALL EDITION', delay: 1800 },
  { type: 'output', text: '', delay: 1900 },
  { type: 'success',text: '  System ready. Type "help" to list available commands.', delay: 2000 },
  { type: 'output', text: '', delay: 2100 },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('outputArea') outputArea!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  lines: ConsoleLine[] = [];
  currentInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  showMatrix = false;
  booting = true;
  cursorBlink = true;
  currentTime = '';
  private shouldScroll = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => { this.cursorBlink = !this.cursorBlink; this.cdr.markForCheck(); }, 530);
    this.runBootSequence();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  glitchActive = false;

  triggerGlitch() {

    this.glitchActive = true;

    setTimeout(() => {
      this.glitchActive = false;
    }, 3000);
  }
  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  }

  private runBootSequence() {
    BOOT_SEQUENCE.forEach((line, i) => {
      setTimeout(() => {
        this.lines.push(line);
        this.shouldScroll = true;
        this.cdr.detectChanges();
        if (i === BOOT_SEQUENCE.length - 1) {
          this.booting = false;
          setTimeout(() => this.inputField?.nativeElement.focus(), 100);
        }
      }, line.delay ?? i * 120);
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.currentInput = '';
      }
    }
  }

  submitCommand() {
    const cmd = this.currentInput.trim();
    if (!cmd) return;

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Echo the typed command
    this.lines.push({ type: 'input', text: cmd, timestamp: ts });

    // Save history
    this.commandHistory.push(cmd);
    this.historyIndex = -1;
    this.currentInput = '';

    const [command, ...args] = cmd.toLowerCase().split(/\s+/);

    if (command === 'clear') {
      this.lines = [];
    } else if (command === 'matrix') {
      this.lines.push(...COMMANDS['matrix']([]));
      this.triggerMatrix();
    } else if (COMMANDS[command]) {
      const result = COMMANDS[command](args);
      this.lines.push(...result);
    } else {
      this.lines.push({
        type: 'error',
        text: `  [!] '${cmd}' is not recognized. Type "help" for commands.`,
      });
    }

    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  private triggerMatrix() {
    this.showMatrix = true;
    setTimeout(() => { this.showMatrix = false; this.cdr.detectChanges(); }, 4000);
  }

  private scrollToBottom() {
    if (this.outputArea) {
      this.outputArea.nativeElement.scrollTop = this.outputArea.nativeElement.scrollHeight;
    }
  }

  focusInput() {
    this.inputField?.nativeElement.focus();
  }

  trackLine(_i: number, line: ConsoleLine) {
    return line.text + _i;
  }
}