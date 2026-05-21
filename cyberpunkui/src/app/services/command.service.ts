import { Injectable, signal } from '@angular/core';
import { DisplayLoadingBarEvent, TextTerminalEvent } from '../Constants';
import { delay, Subject } from 'rxjs';

export interface TerminalEvent {
    type: string;
    displayTime: number;
    payload?: any;
}

@Injectable({
    providedIn: 'root'
})
export class CommandService {

    commands: Record<
        string,
        (args: string[]) => Promise<void> | void
    > = {

            help: async (args) => {
                const target =
                    args[0];

                if (!target) {
                    await this.emitTerminalEvent(TextTerminalEvent, 'COMMANDS: help, clear, scan, status, hack', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '- Each command can have additional information with "help [COMMAND]"', 1);

                    return;
                }
                if (target == "scan") {
                    await this.emitTerminalEvent(TextTerminalEvent, '- scan [NETWORKNAME]: scans the network for potential ICE.', 10);
                }
                if (target == "execute") {
                    await this.emitTerminalEvent(TextTerminalEvent, 'List of available spikes :', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '- scan_network.exe [entrypointnumber]', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Scans entry point network for potential connections.', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- scan_sub_systems.exe', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Scans machine for potential hidden sub systems.', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- reveal_hidden_arasaka_subsystem.exe [subsystemname]', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Attacks encryption of Arasaka firmware for specific hidden information', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- reveal_hidden_torque_subsystem.exe [subsystemname]', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Attacks encryption of Torque firmware for specific hidden information', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- defrag_encryption.exe', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Attacks encryption of Torque firmware for specific hidden information', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- reroute_trace_1.exe', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Attacks encryption of Torque firmware for specific hidden information', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- reroute_trace_2.exe', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Attacks encryption of Torque firmware for specific hidden information', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '', 10);

                    await this.emitTerminalEvent(TextTerminalEvent, '- kill_all_executions.exe', 10);
                    await this.emitTerminalEvent(TextTerminalEvent, '     Kills all ongoing execution but locks the system', 10);


                }


            },

            clear: () => {
                this.emitTerminalEvent(
                    TextTerminalEvent, 'USAGE: scan [target]', 10
                );
            },

            execute: async (args) => {

                const target =
                    args[0];

                if (!target) {

                    this.emitTerminalEvent(
                        TextTerminalEvent, 'USAGE: scan [target]', 10
                    );

                    return;
                }

                this.emitTerminalEvent(
                    TextTerminalEvent, `INITIALIZING SCAN: ${target.toUpperCase()}`, 10
                );

                this.emitTerminalEvent(
                    TextTerminalEvent, 'SCANNING [▒▒▒▒▒▒▒▒▒▒]', 10
                );

                await this.emitTerminalEvent(
                    "PlayLoadingBar", 'SCANNING', 0
                );

                switch (target) {

                    case 'network':

                        this.emitTerminalEvent(
                            TextTerminalEvent, '3 HOSTS DETECTED', 10
                        );

                        break;

                    case 'ice':

                        this.emitTerminalEvent(
                            TextTerminalEvent, 'BLACK ICE DETECTED', 10
                        );

                        break;

                    case 'ports':

                        this.emitTerminalEvent(
                            TextTerminalEvent, 'PORTS 21, 80, 443 OPEN', 10
                        );

                        break;

                    default:

                        this.emitTerminalEvent(
                            TextTerminalEvent, 'UNKNOWN SCAN TARGET', 10
                        );
                }
            },
            scan: async (args) => {

                debugger;
                const target =
                    args[0];

                if (!target) {

                    await this.emitTerminalEvent(
                        TextTerminalEvent, 'USAGE: scan [target]', 10
                    );

                    return;
                }

                await this.emitTerminalEvent(
                    TextTerminalEvent, `INITIALIZING SCAN: ${target.toUpperCase()}`, 10
                );

                await this.emitTerminalEvent(
                    TextTerminalEvent, 'SCANNING [▒▒▒▒▒▒▒▒▒▒]', 10
                );

                await this.emitTerminalEvent(
                    DisplayLoadingBarEvent, 'SCANNING', 0
                );

                switch (target) {

                    case 'network':

                        await this.emitTerminalEvent(
                            TextTerminalEvent, '3 HOSTS DETECTED', 10
                        );

                        break;

                    case 'ice':

                        await this.emitTerminalEvent(
                            TextTerminalEvent, 'BLACK ICE DETECTED', 10
                        );

                        break;

                    case 'ports':

                        await this.emitTerminalEvent(
                            TextTerminalEvent, 'PORTS 21, 80, 443 OPEN', 10
                        );

                        break;

                    default:

                        await this.emitTerminalEvent(
                            TextTerminalEvent, 'UNKNOWN SCAN TARGET', 10
                        );
                }
            },

            status: async () => {
                this.emitTerminalEvent(TextTerminalEvent, 'TRACE: 12%', 10);
                await this.emitTerminalEvent(TextTerminalEvent, 'SYSTEM STABLE', 10);
            },

            hack: async () => {
                await this.emitTerminalEvent(TextTerminalEvent, 'INITIATING INTRUSION...', 10);
                setTimeout(async () => {
                    await this.emitTerminalEvent(TextTerminalEvent, 'PATTERN MODULE READY', 10);
                }, 800);
            },

            hackmode: async () => {
                await this.emitTerminalEvent(TextTerminalEvent, 'ENTERING FULLSCREEN INTRUSION MODE...', 10);
            },

            exit: async () => {
                await this.emitTerminalEvent(TextTerminalEvent, 'EXITING HACK MODE...', 10);
            },
        };


    private eventSubject =
        new Subject<TerminalEvent>();

    events$ =
        this.eventSubject.asObservable();

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

        // wait long enough for rendering
        await new Promise(resolve =>
            setTimeout(resolve, displayTime)
        );
    }
}