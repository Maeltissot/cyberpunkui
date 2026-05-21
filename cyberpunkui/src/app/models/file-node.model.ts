export interface FileNode {
  id: string;
  name: string;
  type:
  | 'folder'
  | 'text'
  | 'hack'
  | 'decrypt'
  | 'network'
  | 'terminal';
  content?: string;
  children?: FileNode[];
}