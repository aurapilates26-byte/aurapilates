import type { Adapter, AdapterSession } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

type CreateUserArg = Parameters<NonNullable<Adapter["createUser"]>>[0];
type GetUserByAccountArg = Parameters<NonNullable<Adapter["getUserByAccount"]>>[0];
type UpdateUserArg = Parameters<NonNullable<Adapter["updateUser"]>>[0];
type DeleteUserArg = Parameters<NonNullable<Adapter["deleteUser"]>>[0];
type LinkAccountArg = Parameters<NonNullable<Adapter["linkAccount"]>>[0];
type UnlinkAccountArg = Parameters<NonNullable<Adapter["unlinkAccount"]>>[0];
type CreateSessionArg = Parameters<NonNullable<Adapter["createSession"]>>[0];
type GetSessionAndUserArg = Parameters<NonNullable<Adapter["getSessionAndUser"]>>[0];
type UpdateSessionArg = Parameters<NonNullable<Adapter["updateSession"]>>[0];
type DeleteSessionArg = Parameters<NonNullable<Adapter["deleteSession"]>>[0];
type CreateVerificationTokenArg = Parameters<NonNullable<Adapter["createVerificationToken"]>>[0];
type UseVerificationTokenArg = Parameters<NonNullable<Adapter["useVerificationToken"]>>[0];

export function credentialsPrismaAdapter(): Adapter {
  return {
    async createUser(data: CreateUserArg) {
      return prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
        },
      }) as never;
    },
    async getUser(id) {
      return prisma.user.findUnique({ where: { id } }) as never;
    },
    async getUserByEmail(email) {
      return prisma.user.findUnique({ where: { email } }) as never;
    },
    async getUserByAccount(_account: GetUserByAccountArg) {
      void _account;
      return null;
    },
    async updateUser(data: UpdateUserArg) {
      return prisma.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
        },
      }) as never;
    },
    async deleteUser(id: DeleteUserArg) {
      return prisma.user.delete({ where: { id } }) as never;
    },
    async linkAccount(_account: LinkAccountArg) {
      void _account;
      return undefined;
    },
    async unlinkAccount(_params: UnlinkAccountArg) {
      void _params;
      return undefined;
    },
    async createSession(data: CreateSessionArg) {
      return prisma.session.create({ data }) as Promise<AdapterSession>;
    },
    async getSessionAndUser(sessionToken: GetSessionAndUserArg) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session) {
        return null;
      }

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          emailVerified: null,
        },
      } as never;
    },
    async updateSession(data: UpdateSessionArg) {
      return prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires,
          userId: data.userId,
        },
      }) as Promise<AdapterSession>;
    },
    async deleteSession(sessionToken: DeleteSessionArg) {
      await prisma.session.delete({ where: { sessionToken } });
    },
    async createVerificationToken(_token: CreateVerificationTokenArg) {
      void _token;
      return null;
    },
    async useVerificationToken(_params: UseVerificationTokenArg) {
      void _params;
      return null;
    },
  };
}
