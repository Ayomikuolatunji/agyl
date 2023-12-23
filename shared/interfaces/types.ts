export interface Error {
  message?: string;
  statusCode?: number;
}


export interface CustomSession {
  cookie: { secure?: boolean };
  secret: string;
  saveUninitialized: boolean;
  resave: boolean;
}