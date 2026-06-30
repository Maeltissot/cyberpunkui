import { Injectable, signal } from '@angular/core';
import { ChatFile, ChatMessage } from '../models/chat.model';

export interface GhostMessage {

    sender: string;

    text: string;
}

export interface PrivateUser {

    ip: string;

    name: string;

    alias: string;

    info: string;

    conversation: Omit<ChatMessage, 'time'>[];
}

export interface MessageBoardConversation {

    ip: string;

    title: string;

    leftParticipant: string;

    rightParticipant: string;

    messages: Omit<ChatMessage, 'time'>[];

    scanRevealed: boolean;

    translated: boolean;

    burned: boolean;
}

interface StoredMessageBoardState {
    conversations?: Record<string, StoredConversationState>;
}

interface StoredConversationState {
    scanRevealed?: boolean;
    translated?: boolean;
    burned?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class GhostMessageService {

    visible = signal(false);

    message =
        signal<GhostMessage | null>(null);

    show(
        sender: string,
        text: string
    ) {

        this.message.set({
            sender,
            text
        });

        this.visible.set(true);
    }

    close() {

        this.visible.set(false);

        this.message.set(null);
    }
}

@Injectable({
    providedIn: 'root'
})
export class MessageBoardService {

    private readonly storageKey =
        'message-board-state';

    readonly privateUsersLevel1: PrivateUser[] = [
        {
            ip: '10.13.37.21',
            name: 'Mira Voss',
            alias: 'STATICMIRA',
            info: 'Ancienne netrunner, maintenant fixer dans les marchés du port Arak.',
            conversation: [
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'Yo V. J\' entendu des petits oiseaux de dire que la job sur la barge Arasaka venait de toi. Ca reste \"on the low\", faudrait pas avoir Maxtax qui vienne toquer aux portes. Bref, parlons biz, j\'ai un job pour toi V. Grosse paie, info en pièce jointe.',
                    files: [
                        {
                            id: 'Arrachage',
                            name: 'Kombo-docks.ztr',
                            content: `
    Paiement : 200 000 eddies,
    Contractant : Inconnu
    Job: Récupération d'un cervo-chip expérimental, facture 'X-D6 Kabuki' 
    `,
                            spiked: false
                        }
                    ]
                },
                {
                    from: 'V.',
                    to: 'STATICMIRA',
                    text: 'Hey chum. C\'est qui le contact? Une des tes connaissances?'
                },
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'Pure biz co V. . Paiement facile si tu veux mon avis. Ma source est solide elle peut faire disparaitre toute empreinte de toi sur ce job, de près ou de loin. Confiance gato!' 
                },
                {
                    from: 'V.',
                    to: 'STATICMIRA',
                    text: 'J\'me renseigne et je reviens vers toi. Mon Info Bro a de quoi me rendre psycho mais il est bon.'
                },
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'Tardes pas! J\'ai des chromés sous stims qui seront heureux de se faire des stacks faciles! Et ils sont dispos dans  la minute, je te fais une fleure la! Va pas me dire que t\'as perdu tes cojones ma fille! Me force pas à envoyer mes petites infos aux corpos.' 
                },
                {
                    from: 'V.',
                    to: 'STATICMIRA',
                    text: 'Souviens toi que je sais ou est ta loc Mira. J\'ai pas le temps pour tes merdes, si tu veux voir se qu\'une prime edgerunner sait faire; j\'te le montre mais tu vas pas aimer comment ça se termine.'
                },
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'Heuuuuu... pas de soucis ma chum, on rigole hein? Réfléchis quand même à ma propal....'
                },
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'Alors V. pas de réponses? Tu vas pas me faire ça!'
                },
                {
                    from: 'STATICMIRA',
                    to: 'V.',
                    text: 'V. steuplé je me suis endétté sur le contrat!'
                },
            ]
        },
        {
            ip: '10.13.37.44',
            name: 'Jax Orin',
            alias: 'PATCHJAX',
            info: 'Sécurité privée, ultra confidentielle. La sucursalle des corpos qui veulent pas se faire choper ou rester discrets. Aime les fraises et s\'est fait installer un "Penis-verax 2000" qui a mal fonctionné. Eunuch.',
            conversation: [
                {
                    from: 'PATCHJAX',
                    to: 'NULLDOVE',
                    text: 'かヅ艶ンヿ翁因医　何ッ 果　れを　謁ビ移　温カヸ流ナ移バ　火で　何ニ　ド王　ッ韻為　営パス　お援ヷ鉛',
                    translatedText: 'Putain qu\' est se qui prend autant de temps? On a des coupures de réseau toutes les 5 minutes. Les portes sont en rad. A ce demander pourquoi je m\'enmerde à  me chromer si y\'a rien de fonctionnel sur quoi s\'interface dans cette baraque de merde!',
                },
                {
                    from: 'NULLDOVE',
                    to: 'PATCHJAX',
                    text: 'Hummmm... on dirait une coupure générale sur le réseau du quartier. Doit y avoir de l\'activité dans le cyberspace local qui overload les connections.'
                },
                {
                    from: 'PATCHJAX',
                    to: 'NULLDOVE',
                    text: '果　れを　謁ビ移　温カヸ流ナ移バ　火で　何ニ　ド王　ッ韻為　営パス　お援ヷ鉛',
                    translatedText: 'Drop de merde... Pourquoi pas garder ça dans un hangar Maxtac comme tout le monde. A croire qu\'ils ont perdus les pédales en haut.'
                },
                {
                    from: 'NULLDOVE',
                    to: 'PATCHJAX',
                    text: 'Jax, fermes la! Je peux pas taffer avec ta conv qui vient me casser les couilles toutes les 5 minutes. Tu as le port d\'accès pour les portes?'
                },
                {
                    from: 'PATCHJAX',
                    to: 'NULLDOVE',
                    text: 'れを れを　謁ビ移　温カヸ流ナ移バ　　営パス　お援ヷ鉛 ヸ流 　ド王　ッ韻為　営パ',
                    translatedText: 'Ouais commences pas. Tiens prends le bon sinon ça va casser le réseau, je sais plus lequel est le bon. Tu devrais pouvoir trouver.',
                    files: [
                        {
                            id: 'Error-doors',
                            name: 'doors-network.pkg',
                            content: 'FUCK YOU',
                            spiked: true
                        },
                        {
                            id: 'Success-doors',
                            name: 'doors-network.st2',
                            content: 'Network access : 10.13.37.121',
                            spiked: false
                        }
                    ]
                },
            ]
        },
        {
            ip: '10.13.37.89',
            name: 'Maximilien De Saint Pharius Delirio III',
            alias: 'GLASS-SAINT',
            info: 'No civic record... officiel. Beaucoup de dossiers balancés derrière un accès au black wall privé. Fils à papa politicien de haute voltige. Accro aux stims à vocation militaire.',
            conversation: [
                {
                    from: 'GLASS-SAINT',
                    to: 'MOTHLINE',
                    text: 'Ho merde MERDE MERDE! PUTAIN, j\'ai besoin de toi chum. TOUT DE SUITE!!! '
                },
                {
                    from: 'MOTHLINE',
                    to: 'GLASS-SAINT',
                    text: 'C\'est quoi le problème? Ce soir je suis avec ma joytoy, ça va couter double.'
                },
                {
                    from: 'GLASS-SAINT',
                    to: 'MOTHLINE',
                    text: 'Putain... PUTAIN. Ok ok double, TRIPLE même, juste vient vite.'
                },
                {
                    from: 'MOTHLINE',
                    to: 'GLASS-SAINT',
                    text: 'Ok ok. Calme. C\'est quoi le cleanup cette fois-ci?'
                },
                {
                    from: 'GLASS-SAINT',
                    to: 'MOTHLINE',
                    text: '...',
                    files: [
                        {
                            id: 'Murder-charges',
                            name: 'Dismembered-hooker.pkg',
                            content: 'Une image brutale d\'une joytoy dont la boite cranienne à été percée par un objet long et cylindrique.',
                            spiked: false
                        }
                    ]
                },
                {
                    from: 'MOTHLINE',
                    to: 'GLASS-SAINT',
                    text: 'BORDEL! J\'arrive dans 5...'
                }
            ]
        }
    ];

    readonly privateUsersLevel2: PrivateUser[] = [
        {
            ip: '10.13.37.203',
            name: 'K.Rad',
            alias: 'KRAD-LOCAL',
            info: 'Local workstation message cache. Recent exchange flagged as relevant.',
            conversation: [
                {
                    from: 'KRAD-LOCAL',
                    to: 'NIGHTCLERK',
                    text: 'You still seeing those shard-cache pings on the workstation?'
                },
                {
                    from: 'NIGHTCLERK',
                    to: 'KRAD-LOCAL',
                    text: 'Yeah. Every few minutes. Something keeps trying to package the same archive.'
                },
                {
                    from: 'KRAD-LOCAL',
                    to: 'NIGHTCLERK',
                    text: 'Leave it alone for now. If the wrong person opens it, the lock should slow them down.'
                },
                {
                    from: 'NIGHTCLERK',
                    to: 'KRAD-LOCAL',
                    text: 'That sounds like a terrible plan.'
                }
            ]
        },
        {
            ip: '10.13.37.204',
            name: 'Rin Vale',
            alias: 'VALE-SWITCH',
            info: 'Internal relay operator. Message board contains routing chatter.',
            conversation: [
                {
                    from: 'VALE-SWITCH',
                    to: 'DOCK-THREE',
                    text: 'Route is unstable. I can keep the line open for six minutes, maybe seven.'
                },
                {
                    from: 'DOCK-THREE',
                    to: 'VALE-SWITCH',
                    text: 'We only need four. Push the logs through and drop the handshake.'
                },
                {
                    from: 'VALE-SWITCH',
                    to: 'DOCK-THREE',
                    text: 'Copy. If this burns, I was never on this channel.'
                },
                {
                    from: 'DOCK-THREE',
                    to: 'VALE-SWITCH',
                    text: 'Relax. It is just a dead archive and a nervous workstation.'
                }
            ]
        },
        {
            ip: '10.13.37.205',
            name: 'Orchid Null',
            alias: 'ORCHID-NULL',
            info: 'Unknown sender. Conversation shows repeated access requests.',
            conversation: [
                {
                    from: 'ORCHID-NULL',
                    to: 'KRAD-LOCAL',
                    text: 'I need the access phrase again. The old one failed.'
                },
                {
                    from: 'KRAD-LOCAL',
                    to: 'ORCHID-NULL',
                    text: 'No. If you lost it, wait for the next handoff.'
                },
                {
                    from: 'ORCHID-NULL',
                    to: 'KRAD-LOCAL',
                    text: 'The next handoff may be too late. Something is awake on the subnet.'
                },
                {
                    from: 'KRAD-LOCAL',
                    to: 'ORCHID-NULL',
                    text: 'Then stop knocking before it notices both of us.'
                }
            ]
        }
    ];

    activeConversation =
        signal<MessageBoardConversation | null>(null);

    openConversation(ip: string): PrivateUser | null {
        const user =
            this.findPrivateUser(ip);

        if (!user) {
            return null;
        }

        const participants =
            this.getParticipants(user);

        this.activeConversation.set({
            ip: user.ip,
            title: `${user.alias} // ${user.ip}`,
            leftParticipant: participants[0],
            rightParticipant: participants[1] ?? participants[0],
            messages: user.conversation,
            scanRevealed: this.isScanRevealed(user.ip),
            translated: this.isTranslated(user.ip),
            burned: this.isBurned(user.ip)
        });

        return user;
    }

    revealSpikeScan(): MessageBoardConversation | null {
        const conversation =
            this.activeConversation();

        if (!conversation) {
            return null;
        }

        this.updateConversationState(
            conversation.ip,
            {
                scanRevealed: true
            }
        );

        this.activeConversation.set({
            ...conversation,
            scanRevealed: true
        });

        return this.activeConversation();
    }

    translateActiveConversation(): MessageBoardConversation | null {
        const conversation =
            this.activeConversation();

        if (!conversation) {
            return null;
        }

        this.updateConversationState(
            conversation.ip,
            {
                translated: true
            }
        );

        this.activeConversation.set({
            ...conversation,
            translated: true
        });

        return this.activeConversation();
    }

    burnActiveConversation() {
        const conversation =
            this.activeConversation();

        if (!conversation) {
            return;
        }

        this.updateConversationState(
            conversation.ip,
            {
                burned: true
            }
        );

        this.activeConversation.set({
            ...conversation,
            burned: true
        });
    }

    openDefaultConversation() {
        this.openConversation(this.privateUsersLevel1[0].ip);
    }

    findPrivateUser(ip: string): PrivateUser | null {
        const normalizedIp =
            ip.trim().toLowerCase();

        return [
            ...this.privateUsersLevel1,
            ...this.privateUsersLevel2
        ].find(user =>
            user.ip.toLowerCase() === normalizedIp
        ) ?? null;
    }

    getActiveFiles(): ChatFile[] {
        const conversation =
            this.activeConversation();

        if (!conversation) {
            return [];
        }

        return conversation.messages.flatMap(message =>
            message.files ?? []
        );
    }

    private isScanRevealed(ip: string): boolean {
        return this.getConversationState(ip)
            .scanRevealed === true;
    }

    private isTranslated(ip: string): boolean {
        return this.getConversationState(ip)
            .translated === true;
    }

    private isBurned(ip: string): boolean {
        return this.getConversationState(ip)
            .burned === true;
    }

    private getConversationState(
        ip: string
    ): StoredConversationState {
        return this.loadState()
            .conversations?.[ip] ?? {};
    }

    private updateConversationState(
        ip: string,
        patch: StoredConversationState
    ) {
        const state =
            this.loadState();

        const conversations =
            state.conversations ?? {};

        conversations[ip] = {
            ...conversations[ip],
            ...patch
        };

        this.saveState({
            conversations
        });
    }

    private loadState(): StoredMessageBoardState {
        try {
            const raw =
                localStorage.getItem(this.storageKey);

            if (!raw) {
                return {};
            }

            return JSON.parse(raw) as StoredMessageBoardState;
        } catch {
            return {};
        }
    }

    private saveState(
        state: StoredMessageBoardState
    ) {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(state)
            );
        } catch {
            // Ignore storage failures so conversations remain readable.
        }
    }

    private getParticipants(
        user: PrivateUser
    ): string[] {
        return Array.from(
            new Set(
                user.conversation.flatMap(message => [
                    message.from,
                    message.to
                ])
            )
        );
    }
}
