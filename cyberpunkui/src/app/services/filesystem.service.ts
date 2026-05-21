import { Injectable } from '@angular/core';
import { FileNode } from '../models/file-node.model';

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {

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
        THE SUBJECT ESCAPED
        THE SUBJECT ESCAPED 1
        THE SUBJECT ESCAPED 2
        THE SUBJECT ESCAPED 3
        THE SUBJECT ESCAPED 4
        THE SUBJECT ESCAPED 5
        AFTER THE BLACKOUT
        DO NOT TRUST THE AI
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
    }
  ];
}