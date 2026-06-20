export interface CameraConnection {

    targetId: string;

    traceCost: number;

    hiddenWeight?: boolean;
}

export interface CameraNode {

    id: string;

    name: string;

    x: number;
    y: number;

    compromised: boolean;

    spiked?: boolean;

    spikeTraceCost?: number;

    target?: boolean;

    entry?: boolean;

    connections: CameraConnection[];
}
