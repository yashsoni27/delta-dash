export interface SessionInfo {
  Meeting: Meeting;
  ArchiveStatus: { Status: string };
  Key: number;
  Type: string;
  Name: string;
  StartDate: string;
  EndDate: string;
  GmtOffset: string;
  Path: string;
  _kf: boolean;
}

interface Meeting {
  Key: number;
  Name: string;
  OfficialName: string;
  Location: string;
  Number: number;
  Country: NameObj;
  Circuit: NameObj;
}

interface NameObj {
  Key: number;
  Code?: string;
  Name?: string;
  ShortName?: string;
}
