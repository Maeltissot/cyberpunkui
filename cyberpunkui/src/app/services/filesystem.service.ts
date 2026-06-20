import { computed, Injectable, signal } from '@angular/core';
import { FileNode } from '../models/file-node.model';

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {

  private readonly hiddenDataRevealed = signal(false);

  readonly visibleRoot = computed(() =>
    this.root.filter(file =>
      !file.hidden || this.hiddenDataRevealed()
    )
  );

  root: FileNode[] = [
    {
      id: '1',
      name: 'CORP_FILES',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'SUBJECT_OMEGA.txt',
          type: 'text',
          content: `
            SUBJECT STATUS: UNSTABLE

            Neural synchronization failure detected.

            Memory bleed progressing.
          `
        },
        {
          id: '3',
          name: 'BLACKSITE',
          type: 'folder',
          children: [
            {
              id: '4',
              name: 'EXPERIMENT_LOG.txt',
              type: 'text',
              content: `
                Experiment #447

                The host survived the implant procedure.

                Unexpected hallucinations reported.
              `
            }
          ]
        }
      ]
    },
    {
      id: '5',
      name: 'MAIL_ARCHIVE',
      type: 'folder',
      children: [
        {
          id: '6',
          name: 'MESSAGE_01.txt',
          type: 'text',
          content: `
            We have been compromised.

            Move the asset immediately.
          `
        }
      ]
    },
    {
        id: '6',
        name: 'Hacked',
        type: 'folder',
        children: [
            {
            id: 'hack-1',
            name: 'PATTERN_INTRUSION.exe',
            type: 'hack'
            }
        ]
    },
    {
        id: 'decrypt-1',
        name: 'MEMORY_FRAGMENT.enc',
        type: 'decrypt',
        content: `
        Je suis le Ténébreux, – le Veuf, – l’Inconsolé,
        Le prince d’Aquitaine à la tour abolie :
        Ma seule étoile est morte, – et mon luth constellé
        Porte le Soleil noir de la Mélancolie.

        Dans la nuit du tombeau, toi qui m’as consolé,
        Rends-moi le Pausilippe et la mer d’Italie,
        La fleur qui plaisait tant à mon cœur désolé,
        Et la treille où le pampre à la rose s’allie.
        `
    },
    {
        id: 'network-1',
        name: 'NET_ROUTE.exe',
        type: 'network'
    },
    {
        id: 'terminal-1',
        name: 'TERMINAL.exe',
        type: 'terminal'
    },
    {
      id: 'hidden-project-omega',
      name: '.PROJECT_OMEGA',
      type: 'folder',
      hidden: true,
      children: [
        {
          id: 'hidden-project-omega-brief',
          name: 'CLASSIFIED_BRIEF.txt',
          type: 'text',
          content: `
            PROJECT OMEGA // EYES ONLY

            The subject is still active.
            All public records must remain suppressed.
          `
        }
      ]
    },
    {
      id: 'hidden-security-logs',
      name: '.SECURITY_LOGS',
      type: 'folder',
      hidden: true,
      children: [
        {
          id: 'hidden-security-breach-log',
          name: 'BREACH_0417.log',
          type: 'text',
          content: `
            03:14:07 UNAUTHORIZED ACCESS DETECTED
            03:14:12 CAMERA ARCHIVE PURGED
            03:14:19 INTERNAL ROUTE 10.13.37.200 EXPOSED
          `
        }
      ]
    }
  ];

  revealHiddenData(): boolean {
    if (this.hiddenDataRevealed()) {
      return false;
    }

    this.hiddenDataRevealed.set(true);
    return true;
  }

  resetHiddenData() {
    this.hiddenDataRevealed.set(false);
  }
}
