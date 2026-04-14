import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: number;
      role: string;
      email?: string;
    };
    user: {
      id: number;
      role: string;
      email?: string;
    };
  }
}