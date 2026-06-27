import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DisplayLoadingBarEvent, TextTerminalEvent } from '../constants';
import { GameLevel, GameStateService } from './game-state.service';
import { InvestigationService } from './investigation.service';
import { IntrusionService } from './intrusion.service';
import { GhostMessageService, MessageBoardService } from './message.service';
import { CameraNetworkService } from './camera-network.service';
import { FilesystemService } from './filesystem.service';

export interface TerminalEvent {
    type: string;
    displayTime: number;
    payload?: any;
}

type TerminalCommand =
    (args: string[]) => Promise<void> | void;

type TerminalCommandMap =
    Record<string, TerminalCommand>;

interface LevelOneEndpoint {
    ip: string;
    name: string;
    alias: string;
    info: string;
    showInChat: boolean;
    scene: 'droneHijack' | 'cameraNetwork' | 'implantCalibration';
}

@Injectable({
    providedIn: 'root'
})
export class CommandService {

    private readonly levelTwoDesktopIp = '10.13.37.200';

    private readonly levelOneEndpoints: LevelOneEndpoint[] = [
        {
            ip: '10.13.37.120',
            name: 'Hangar Cameras',
            alias: 'CAMERA-FEEDS-01/07',
            info: 'Camera feed alongside the Hangar.',
            showInChat: true,
            scene: 'cameraNetwork'
        },
        {
            ip: '10.13.37.121',
            name: 'Door network',
            alias: 'DOOR-NETWORK',
            info: 'Contrôle les portes et les points d\'accès du hangar.',
            showInChat: false,
            scene: 'droneHijack'
        },
        {
            ip: '10.13.37.130',
            name: 'Ripperdoc Neural Rig',
            alias: 'IMPLANT-CAL',
            info: 'Calibration et réglages de la tourelle. Permet de faire passer de l\'interferance. Solution unique ET temporaire.',
            showInChat: true,
            scene: 'implantCalibration'
        }
    ];

    private readonly savedStateKeys = [
        'trace-firewall-chase-state',
        'social-engineering-hack-state',
        'daemon-slot-sequencer-state',
        'drone-hijack-state',
        'message-board-state'
    ];

    constructor(
        public game: GameStateService,
        public investigation: InvestigationService,
        public intrusionService: IntrusionService,
        public ghostMessageService: GhostMessageService,
        public messageBoard: MessageBoardService,
        public cameraNetwork: CameraNetworkService,
        public filesystem: FilesystemService
    ) { }

    get commands(): TerminalCommandMap {
        return {
            ...this.commonCommands,
            ...this.levelCommands[this.game.level()],
            ...this.privateUserCommands,
            ...this.hiddenCommands
        };
    }

    visibleCommandNames(): string[] {
        return [
            ...Object.keys(this.commonCommands),
            ...Object.keys(this.levelCommands[this.game.level()])
        ].sort();
    }

    private get privateUserCommands(): TerminalCommandMap {
        if (this.game.level() !== 'level-1') {
            return {};
        }

        return Object.fromEntries(
            this.messageBoard.privateUsersLevel1.map(user => [
                user.ip.toLowerCase(),
                async () => {
                    await this.openPrivateConversation(user.ip);
                }
            ])
        );
    }

    private readonly commonCommands: TerminalCommandMap = {
        help: async (args) => {
            const target =
                args[0];

            if (!target) {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    `LEVEL: ${this.game.level().toUpperCase()}`,
                    10
                );

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    `COMMANDS: ${this.visibleCommandNames().join(', ')}`,
                    10
                );

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- Each command can have additional information with "help [COMMAND]"',
                    1
                );

                return;
            }

            await this.printCommandHelp(target);
        },

        clear: async () => {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'TERMINAL BUFFER PURGE REQUESTED',
                10
            );
        },

        status: async () => {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `LEVEL: ${this.game.level().toUpperCase()}`,
                10
            );

            await this.emitTerminalEvent(
                TextTerminalEvent,
                `SCENE: ${this.game.scene().toUpperCase()}`,
                10
            );

            await this.emitTerminalEvent(
                TextTerminalEvent,
                'TRACE: 12%',
                10
            );

            await this.emitTerminalEvent(
                TextTerminalEvent,
                'SYSTEM STABLE',
                10
            );
        },

        level: async () => {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `ACTIVE LEVEL: ${this.game.level().toUpperCase()}`,
                10
            );
        },

        setlevel: async (args) => {
            const level =
                this.normalizeLevel(args[0]);

            if (!level) {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'USAGE: setlevel [1|2|3]',
                    10
                );

                return;
            }

            this.game.setLevel(level);

            await this.emitTerminalEvent(
                TextTerminalEvent,
                `GAME LEVEL SAVED: ${level.toUpperCase()}`,
                10
            );

            await this.emitTerminalEvent(
                TextTerminalEvent,
                `AVAILABLE COMMANDS: ${this.visibleCommandNames().join(', ')}`,
                10
            );
        },

        exit: async () => {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'EXITING HACK MODE...',
                10
            );

            this.cameraNetwork.close();
            this.game.setScene('cyberspace');
        }


    };

    private readonly hiddenCommands: TerminalCommandMap = {
        clearcache: async () => {
            this.clearSavedGameState();
            this.cameraNetwork.close();
            this.filesystem.resetHiddenData();
            this.game.resetSavedState();

            await this.emitTerminalEvent(
                TextTerminalEvent,
                'CACHE PURGED: GAME STATE RESET TO LEVEL-1',
                10
            );
        }
    };

    private readonly levelCommands: Record<GameLevel, TerminalCommandMap> = {
        'level-1': {
            messageme: async () => {
                this.ghostMessageService.show(
                    'UNKNOWN',
                    'Hey chum... I know you, we need to talk.'
                );
            },

            scan: async () => {
                await this.runPrivateUserScan();
            },

            connect: async (args) => {
                await this.connectLevelOneIp(args);
            },

            spikescan: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'LOADING BLACK ICE SIGNATURES...',
                    10
                );
                
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'LISTENING FOR PREDATORY HIDDEN SPIKES',
                    10
                );
                
                await this.emitTerminalEvent(
                    DisplayLoadingBarEvent,
                    'SPIKE TRACE',
                    0
                );
                
                await this.delay(1200);
                
                await this.runSpikeScan();
                this.cameraNetwork.revealSpikedNodes();

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'SPIKES REVEALED',
                    10
                );
            },
            translate: async () => {
                await this.runTranslate();
            },
            scanhiddendata: async () => {
                this.cameraNetwork.revealHiddenWeights();

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'HIDDEN DATA SCANNED',
                    10
                );
            }
        },
        'level-2': {
            connect: async (args) => {
                await this.connectLevelTwoIp(args);
            },

            revealhiddendata: async () => {
                const revealed = this.filesystem.revealHiddenData();

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    revealed
                        ? 'HIDDEN DATA REVEALED: 2 FOLDERS FOUND'
                        : 'HIDDEN DATA ALREADY VISIBLE',
                    10
                );
            },

            enterin: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'INITIALIZING INVESTIGATION LINK...',
                    10
                );

                this.game.setScene('investigation');
            },
            scanin: () => {
                this.investigation.runCommand('scanin');
            },

            decryptin: () => {
                this.investigation.runCommand('decryptin');
            },
            
            

            scan: async (args) => {
                await this.runScanCommand(args);
            },

            hack: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'INITIATING INTRUSION...',
                    10
                );

                setTimeout(async () => {
                    await this.emitTerminalEvent(
                        TextTerminalEvent,
                        'PATTERN MODULE READY',
                        10
                    );
                }, 800);
            },
            daemons: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'DAEMON SLOT SEQUENCER READY',
                    10
                );

                this.game.setScene('daemonSequencer');
            },

            firewall: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'TRACE FIREWALL CHASE LOADED',
                    10
                );

                this.game.setScene('traceFirewall');
            },

            social: async () => {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'SOCIAL ENGINEERING CHANNEL OPEN',
                    10
                );

                this.game.setScene('socialHack');
            },
        }
    };

    private readonly eventSubject =
        new Subject<TerminalEvent>();

    events$ =
        this.eventSubject.asObservable();

    private async printCommandHelp(
        target: string
    ) {
        switch (target.toLowerCase()) {
            case 'scan':
                if (this.game.level() === 'level-1') {
                    await this.emitTerminalEvent(
                        TextTerminalEvent,
                        '- scan: lists private users and network services detected on the local mesh. Use "connect [IP]" to open one.',
                        10
                    );
                    return;
                }

                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- scan [NETWORKNAME]: scans the network for potential ICE.',
                    10
                );
                return;

            case 'message':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- message [IP]: opens the private message board for a scanned user.',
                    10
                );
                return;

            case 'clear':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- Clears the console of previous text.',
                    10
                );
                return;

            case 'connect':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- connect [IP]: Allows you to connect to a specific IP address.',
                    10
                );
                return;

            case 'spikescan':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- spikescan: scans interface for any spikes (viruses), and reveals them if found.',
                    10
                );
                return;

            case 'translate':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- translate: translates unreadable text in the active message board.',
                    10
                );
                return;

            case 'setlevel':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- setlevel [1|2|3]: saves the active game level in browser cache.',
                    10
                );
                return;

            case 'scanhiddendata':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- scanHiddenData: reveals hidden information on the screen you are looking is any.',
                    10
                );
                return;

            case 'revealhiddendata':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- revealHiddenData: reveals hidden folders on the connected desktop.',
                    10
                );
                return;

            case 'revealspikes':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- revealspikes: scans the camera network and reveals spiked nodes.',
                    10
                );
                return;

            case 'exit':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '- exit: returns to the cyberdeck cyberspace screen.',
                    10
                );
                return;

            default:
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'NO HELP ENTRY FOR COMMAND',
                    10
                );
        }
    }

    private async runScanCommand(
        args: string[]
    ) {
        const target =
            args[0];

        if (!target) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'USAGE: scan [target]',
                10
            );

            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `INITIALIZING SCAN: ${target.toUpperCase()}`,
            10
        );

        await this.emitTerminalEvent(
            TextTerminalEvent,
            'SCANNING [----------]',
            10
        );

        await this.emitTerminalEvent(
            DisplayLoadingBarEvent,
            'SCANNING',
            0
        );

        switch (target) {
            case 'network':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    '3 HOSTS DETECTED',
                    10
                );
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    ` - ${this.levelTwoDesktopIp} | CORP WORKSTATION / DESKTOP`,
                    10
                );
                break;

            case 'ice':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'BLACK ICE DETECTED',
                    10
                );
                break;

            case 'ports':
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'PORTS 21, 80, 443 OPEN',
                    10
                );
                break;

            default:
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    'UNKNOWN SCAN TARGET',
                    10
                );
        }
    }

    private async runPrivateUserScan() {
        await this.emitTerminalEvent(
            TextTerminalEvent,
            'SCANNING LOCAL PRIVATE COMM TRAFFIC...',
            10
        );

        await this.emitTerminalEvent(
            DisplayLoadingBarEvent,
            'NETWORK SCAN...',
            0
        );

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `5 ACCESSIBLE HOSTS DETECTED`,
            10
        );

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `
                 ______________
                |   MESSAGE    |
                |   DEVICES    |
                |______________|
            `,
            10
        );

        for (const user of this.messageBoard.privateUsersLevel1) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                ` - ${user.ip} | ${user.name} / ${user.alias}  
    ${user.info}`,
                10
            );
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `
                 ______________
                |   PRIVATE    |
                |   NETWORK    |
                |______________|
            `,
            10
        );
        await this.emitTerminalEvent(
            TextTerminalEvent,
            '',
            10
        );

        for (const endpoint of this.levelOneEndpoints) {
            if (endpoint.showInChat) {
                await this.emitTerminalEvent(
                    TextTerminalEvent,
                    ` - ${endpoint.ip} | ${endpoint.name} / ${endpoint.alias}  
                    ${endpoint.info}`,
                    10
                );
            }
        }
        await this.emitTerminalEvent(
            TextTerminalEvent,
            '',
            10
        );
        await this.emitTerminalEvent(
            TextTerminalEvent,
            'USE "connect [IP]" TO OPEN A HOST. USE "spikescan" OR "translate" INSIDE A MESSAGE BOARD.',
            10
        );
    }

    private async openPrivateConversation(
        ip: string
    ) {
        const user =
            this.messageBoard.openConversation(ip);

        if (!user) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `NO PRIVATE USER FOUND AT ${ip}`,
                10
            );

            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `OPENING PRIVATE BOARD: ${user.alias} @ ${user.ip}`,
            10
        );

        this.game.setScene('message');
    }

    private async connectLevelOneIp(
        args: string[]
    ) {
        const ip =
            args[0];

        if (!ip) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'USAGE: connect [IP]',
                10
            );

            return;
        }

        const endpoint =
            this.levelOneEndpoints.find(item =>
                item.ip.toLowerCase() === ip.toLowerCase()
            );

        if (endpoint) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `CONNECTING: ${endpoint.alias} @ ${endpoint.ip}`,
                10
            );

            if (endpoint.scene === 'cameraNetwork') {
                this.game.setScene('cameraNetwork');
                await this.cameraNetwork.openNetwork();
                return;
            }

            this.game.setScene(endpoint.scene);
            return;
        }

        const user =
            this.messageBoard.findPrivateUser(ip);

        if (user) {
            await this.openPrivateConversation(ip);
            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `NO HOST FOUND AT ${ip}`,
            10
        );
    }

    private async connectLevelTwoIp(
        args: string[]
    ) {
        const ip = args[0];

        if (!ip) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'USAGE: connect [IP]',
                10
            );
            return;
        }

        if (ip !== this.levelTwoDesktopIp) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `NO HOST FOUND AT ${ip}`,
                10
            );
            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `CONNECTING: CORP WORKSTATION @ ${this.levelTwoDesktopIp}`,
            10
        );

        this.game.setScene('desktop');
    }

    private async runSpikeScan() {
        const conversation =
            this.messageBoard.activeConversation();

        if (
            this.game.scene() !== 'message' ||
            !conversation
        ) {
            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `SPIKESCAN TARGET: ${conversation.title}`,
            10
        );

        await this.emitTerminalEvent(
            DisplayLoadingBarEvent,
            'SPIKESCAN',
            0
        );

        const updatedConversation =
            this.messageBoard.revealSpikeScan();

        const files =
            this.messageBoard.getActiveFiles();

        if (!updatedConversation || files.length === 0) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'NO ATTACHMENTS FOUND',
                10
            );

            return;
        }

        for (const file of files) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                `${file.name}: ${file.spiked ? 'SPIKED' : 'CLEAN'}`,
                10
            );
        }
    }

    private async runTranslate() {
        const conversation =
            this.messageBoard.activeConversation();

        if (
            this.game.scene() !== 'message' ||
            !conversation
        ) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'NO ACTIVE MESSAGE BOARD TO TRANSLATE',
                10
            );

            return;
        }

        if (conversation.burned) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'TRANSLATION BLOCKED: SECURITY TRACE ACTIVE',
                10
            );

            return;
        }

        if (conversation.translated) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'TRANSLATION LAYER ALREADY ACTIVE',
                10
            );

            return;
        }

        const hasTranslations =
            conversation.messages.some(message =>
                !!message.translatedText
            );

        if (!hasTranslations) {
            await this.emitTerminalEvent(
                TextTerminalEvent,
                'NO TRANSLATION PROFILE FOUND FOR THIS BOARD',
                10
            );

            return;
        }

        await this.emitTerminalEvent(
            TextTerminalEvent,
            `TRANSLATING BOARD: ${conversation.title}`,
            10
        );

        await this.emitTerminalEvent(
            DisplayLoadingBarEvent,
            'TRANSLATE',
            0
        );

        this.messageBoard.translateActiveConversation();

        await this.emitTerminalEvent(
            TextTerminalEvent,
            'TRANSLATION LAYER APPLIED',
            10
        );
    }

    private normalizeLevel(
        rawLevel?: string
    ): GameLevel | null {
        switch (rawLevel?.toLowerCase()) {
            case '1':
            case 'level-1':
                return 'level-1';

            case '2':
            case 'level-2':
                return 'level-2';

            default:
                return null;
        }
    }

    public async emitTerminalEvent(
        type: string,
        payload?: any,
        displayTime: number = 0
    ) {

        this.eventSubject.next({
            type,
            payload,
            displayTime
        });

        await new Promise(resolve =>
            setTimeout(resolve, displayTime)
        );
    }

    private delay(ms: number) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );
    }

    private clearSavedGameState() {
        try {
            for (const key of this.savedStateKeys) {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignore storage failures so the reset command still restores runtime state.
        }
    }
}
