declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

export {};
