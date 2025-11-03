export interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailResponse {
  data: { id: string } | null;
  error: Error | null;
  payload: SendEmailOptions;
}

export class Resend {
  constructor(apiKey: string);
  emails: {
    send(options: SendEmailOptions): Promise<SendEmailResponse>;
  };
}
