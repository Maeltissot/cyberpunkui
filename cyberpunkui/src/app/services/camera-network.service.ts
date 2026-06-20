import { Injectable, signal } from '@angular/core';
import { CameraNode } from '../models/camera-network.model';

@Injectable({
    providedIn: 'root'
})
export class CameraNetworkService {

    active = signal(false);

    completed = signal(false);

    trace = signal(0);

    currentNode = signal('ENTRY');

    errorMessage =
        signal<string | null>(null);

    nodes = signal<CameraNode[]>([]);

    hiddenWeightsVisible = signal(false);

    spikedNodesVisible = signal(false);

    loading = signal(false);

    loadingProgress = signal(0);

    loadingLines = signal<string[]>([]);

    async openNetwork() {
        this.active.set(true);
        this.completed.set(false);
        this.errorMessage.set(null);
        this.loading.set(true);
        this.loadingProgress.set(0);
        this.loadingLines.set([]);

        const steps = [
            'PINGING LOCAL CAMERA BUS',
            'DISCOVERING RTSP STREAMS',
            'NEGOTIATING ACCESS TOKENS',
            'SPOOFING CAMERA CONTROLLER',
            'BUILDING NODE ROUTE MAP',
            'INJECTING VIEWPORT HOOKS',
            'CAMERA NETWORK LINK ESTABLISHED'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.loadingLines.update(lines => [
                ...lines,
                steps[i]
            ]);

            this.loadingProgress.set(
                Math.round(((i + 1) / steps.length) * 100)
            );

            await new Promise(resolve => setTimeout(resolve, 450));
        }

        this.trace.set(0);
        this.currentNode.set('ENTRY');
        this.hiddenWeightsVisible.set(false);
        this.spikedNodesVisible.set(false);


        this.nodes.set([
            {
                id: 'ENTRY',
                name: 'NET ACCESS',
                x: 500,
                y: 100,
                entry: true,
                compromised: true,

                connections: [
                    {
                        targetId: 'CAM01',
                        traceCost: 10
                    }
                ]
            },

            {
                id: 'CAM01',
                name: 'LOBBY',
                x: 500,
                y: 200,

                compromised: false,

                connections: [
                    {
                        targetId: 'CAM02',
                        traceCost: 25,
                        hiddenWeight: true
                    },
                    {
                        targetId: 'CAM03',
                        traceCost: 15,
                        hiddenWeight: true
                    }
                ]
            },
            {
                id: 'CAM02',
                name: 'Node2',
                x: 300,
                y: 300,

                compromised: false,

                connections: [
                    {
                        targetId: 'CAM04',
                        traceCost: 25,
                        hiddenWeight: true
                    },
                    {
                        targetId: 'CAM05',
                        traceCost: 20,
                        hiddenWeight: true
                    }
                ]
            },
            {
                id: 'CAM03',
                name: 'LOBBY3',
                x: 700,
                y: 300,

                compromised: false,

                connections: [
                    {
                        targetId: 'CAM06',
                        traceCost: 25,
                        hiddenWeight: true
                    },
                    {
                        targetId: 'CAM07',
                        traceCost: 40
                    }
                ]
            },
            {
                id: 'CAM04',
                name: 'Node4',
                x: 200,
                y: 400,

                compromised: false,
                spiked: true,
                spikeTraceCost: 50,

                connections: [
                    {
                        targetId: 'EXIT',
                        traceCost: 25,
                        hiddenWeight: true
                    }
                ]
            },
            {
                id: 'CAM05',
                name: 'Node5',
                x: 400,
                y: 400,

                compromised: false,
                spiked: true,
                spikeTraceCost: 50,

                connections: [
                    {
                        targetId: 'EXIT',
                        traceCost: 25,
                        hiddenWeight: true
                    }
                ]
            },
            {
                id: 'CAM06',
                name: 'Node6',
                x: 600,
                y: 400,

                compromised: false,
                spiked: true,
                spikeTraceCost: 50,


                connections: [
                    {
                        targetId: 'EXIT',

                        traceCost: 10,
                        hiddenWeight: true
                    }
                ]
            }, {
                id: 'CAM07',
                name: 'Node7',
                x: 800,
                y: 400,

                compromised: false,

                connections: [
                    {
                        targetId: 'CAM08',
                        traceCost: 25,
                        hiddenWeight: true
                    }
                ]
            }, {
                id: 'CAM08',
                name: 'Node8',
                x: 800,
                y: 500,

                compromised: false,

                connections: [
                    {
                        targetId: 'EXIT',
                        traceCost: 5,
                        hiddenWeight: true
                    }
                ]
            },
            {
                id: 'EXIT',
                name: 'Exit',
                x: 500,
                y: 600,

                compromised: false,
                target: true,
                connections: []
            },

        ]);
        this.loading.set(false);
    }

    selectNode(nodeId: string) {

        const current =
            this.currentNode();

        const nodes =
            this.nodes();

        const currentNode =
            nodes.find(
                n => n.id === current
            );

        if (!currentNode)
            return;

        const connection =
            currentNode.connections.find(
                c => c.targetId === nodeId
            );

        if (!connection) {
            return;
        }

        this.currentNode.set(nodeId);

        const route =
            currentNode.connections.find(
                c => c.targetId === nodeId
            );

        if (!route)
            return;

        this.trace.update(
            trace =>
                trace + route.traceCost
        );

        const targetNode =
            nodes.find(
                n => n.id === nodeId
            );

        if (targetNode?.spiked) {

            this.trace.update(
                trace =>
                    trace + (targetNode.spikeTraceCost ?? 15)
            );
        }

        this.nodes.update(nodes =>
            nodes.map(n => {

                if (n.id === nodeId) {

                    return {
                        ...n,
                        compromised: true
                    };
                }

                return n;
            })
        );
    }

    hasWon() {

        return this.currentNode() === 'EXIT';
    }

    hasLost(): boolean {

        if (this.trace() >= 100) {

            this.triggerTraceFailure();

            return true;
        }
        return false;
    }
    triggerTraceFailure() {

        this.active.set(false);

        this.errorMessage.set(
            `
TRACE LIMIT EXCEEDED

SECURITY AI HAS LOCKED
THE CAMERA NETWORK

CONNECTION TERMINATED
`
        );
    }

    close() {

        this.active.set(false);
    }

    relinquishControl() {
        this.active.set(false);
        this.completed.set(true);
    }

    revealHiddenWeights() {

        this.hiddenWeightsVisible.set(true);
    }

    revealSpikedNodes() {

        this.spikedNodesVisible.set(true);
    }
}
