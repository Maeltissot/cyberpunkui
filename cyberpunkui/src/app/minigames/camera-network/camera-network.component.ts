import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraNetworkService } from '../../services/camera-network.service';
import { CameraConnection } from '../../models/camera-network.model';

@Component({
    selector: 'app-camera-network',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './camera-network.component.html',
    styleUrls: ['./camera-network.component.scss']
})
export class CameraNetworkComponent {

    constructor(
        public network:
            CameraNetworkService
    ) { }

    clickNode(id: string) {

        this.network.selectNode(id);

        if (
            this.network.hasWon()
        ) {
            this.network.relinquishControl();
            return;
        }

        if (
            this.network.hasLost()
        ) {

            this.network.close();
        }
    }

    getNode(id: string) {
        return this.network
            .nodes()
            .find(node => node.id === id);
    }
    getNodeX(id: string): number {

        const node =
            this.network.nodes()
                .find(n => n.id === id);

        return node?.x ?? 0;
    }

    getNodeY(id: string): number {

        const node =
            this.network.nodes()
                .find(n => n.id === id);

        return node?.y ?? 0;
    }

    shouldShowWeight(connection: CameraConnection): boolean {

        return !connection.hiddenWeight ||
            this.network.hiddenWeightsVisible();
    }

    getConnectionLabelX(
        sourceX: number,
        targetId: string
    ): number {

        return (sourceX + this.getNodeX(targetId)) / 2;
    }

    getConnectionLabelY(
        sourceY: number,
        targetId: string
    ): number {

        return (sourceY + this.getNodeY(targetId)) / 2;
    }
}
