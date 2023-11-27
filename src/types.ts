export type SMSHeader = {
  encoding: string;
  smsc: string;
  smscType: string;
  smscPlan: string;
};

export type SMSUdh = {
  referenceNumber: number;
  parts: number;
  part: 1;
};

export type SMSMessage = {
  sender: string;
  index: number;
  message: string;
  dateTimeSent: Date;
  msgStatus: number;
  header: SMSHeader;
  udh?: SMSUdh;
  udhs?: SMSUdh[];
  rowid?: number | string;
};

export type ParsedEmail = {
  from: string;
  subject: string;
  text: string;
  html: string;
  secret: string;
};
