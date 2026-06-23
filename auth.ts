import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { credentialsPrismaAdapter } from "@/lib/auth-adapter";
import {
  authenticateMemberByPhoneAndQrKey,
  authenticateMemberByQrPublicIdAndKey,
  memberPhoneLoginErrorMessage,
} from "@/lib/member-phone-login";
import {
  authenticateCoachByPhoneAndQrKey,
  authenticateCoachByQrPublicIdAndKey,
  coachPhoneLoginErrorMessage,
} from "@/lib/coach-phone-login";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";

const INACTIVITY_TIMEOUT_SECONDS = 2 * 60 * 60;
const MAX_SESSION_LIFETIME_SECONDS = 8 * 60 * 60;

type TokenWithMeta = JWT & {
  role?: string;
  sessionStartedAt?: number;
  lastActivityAt?: number;
  sessionToken?: string;
  expired?: boolean;
};

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function nowDate() {
  return new Date();
}

function parseTokenTimestamp(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function invalidateToken(token: TokenWithMeta) {
  delete token.sub;
  delete token.role;
  delete token.sessionToken;
  token.expired = true;
  return token;
}

function computeAbsoluteExpiry(createdAt: Date) {
  return new Date(createdAt.getTime() + MAX_SESSION_LIFETIME_SECONDS * 1000);
}

function computeSlidingExpiry(now: Date, absoluteExpiry: Date) {
  const sliding = new Date(now.getTime() + INACTIVITY_TIMEOUT_SECONDS * 1000);
  return sliding.getTime() > absoluteExpiry.getTime() ? absoluteExpiry : sliding;
}

function newSessionToken() {
  return randomBytes(32).toString("hex");
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const unifiedSignInSchema = z.object({
  identifier: z.string().trim().min(1),
  secret: z.string().min(1),
});

function looksLikeEmail(identifier: string) {
  return identifier.includes("@");
}

function readUnifiedCredentials(credentials: Record<string, unknown> | undefined) {
  const identifier =
    typeof credentials?.identifier === "string"
      ? credentials.identifier
      : typeof credentials?.email === "string"
        ? credentials.email
        : typeof credentials?.phone === "string"
          ? credentials.phone
          : "";

  const secret =
    typeof credentials?.secret === "string"
      ? credentials.secret
      : typeof credentials?.password === "string"
        ? credentials.password
        : typeof credentials?.key === "string"
          ? credentials.key
          : "";

  return unifiedSignInSchema.safeParse({ identifier, secret });
}

const qrScanSignInSchema = z.object({
  loginType: z.literal("QR_SCAN"),
  publicId: z.string().trim().min(10),
  key: z.string().trim().min(1),
});

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export const authOptions: NextAuthOptions = {
  secret: resolveAuthSecret(),
  adapter: credentialsPrismaAdapter(),
  session: {
    strategy: "jwt",
    maxAge: MAX_SESSION_LIFETIME_SECONDS,
    updateAge: 5 * 60,
  },
  pages: {
    signIn: "/connexion",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        secret: { label: "Secret", type: "password" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        loginType: { label: "Login Type", type: "text" },
        publicId: { label: "Public Id", type: "text" },
        key: { label: "Key", type: "password" },
      },
      async authorize(credentials) {
        const parsedQrScanCredentials = qrScanSignInSchema.safeParse(credentials);
        if (parsedQrScanCredentials.success) {
          const { publicId, key } = parsedQrScanCredentials.data;

          const staffKeyHash = process.env.STAFF_QR_KEY_HASH;
          const adminEmail = process.env.ADMIN_LOGIN_EMAIL?.trim();

          if (staffKeyHash && (sha256(key) === staffKeyHash || key === staffKeyHash)) {
            if (!adminEmail) {
              return null;
            }

            const adminUser = await prisma.user.findUnique({
              where: { email: adminEmail },
            });

            if (!adminUser) {
              return null;
            }

            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              image: adminUser.image,
              role: adminUser.role,
            };
          }

          const coachResult = await authenticateCoachByQrPublicIdAndKey(publicId, key);
          if (coachResult.ok) {
            const { user } = coachResult.value;
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
            };
          }

          const memberResult = await authenticateMemberByQrPublicIdAndKey(publicId, key);
          if (!memberResult.ok) {
            return null;
          }

          const { user } = memberResult.value;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        }

        const parsedUnified = readUnifiedCredentials(credentials);
        if (!parsedUnified.success) {
          return null;
        }

        const { identifier, secret } = parsedUnified.data;

        if (looksLikeEmail(identifier)) {
          const parsedCredentials = signInSchema.safeParse({ email: identifier, password: secret });
          if (!parsedCredentials.success) {
            return null;
          }

          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user?.password) {
            return null;
          }

          const passwordMatches = await compare(password, user.password);
          if (!passwordMatches) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        }

        const coachResult = await authenticateCoachByPhoneAndQrKey(identifier, secret);
        if (coachResult.ok) {
          const { user } = coachResult.value;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        }
        if (coachResult.reason !== "NOT_FOUND") {
          throw new Error(coachPhoneLoginErrorMessage(coachResult.reason));
        }

        const memberResult = await authenticateMemberByPhoneAndQrKey(identifier, secret);
        if (!memberResult.ok) {
          throw new Error(memberPhoneLoginErrorMessage(memberResult.reason));
        }

        const { user } = memberResult.value;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    async signOut({ token }) {
      const t = token as TokenWithMeta | null;
      const sessionToken = t?.sessionToken;
      if (!sessionToken) return;

      await prisma.session.delete({ where: { sessionToken } }).catch(() => undefined);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      const now = nowInSeconds();
      const t = token as TokenWithMeta;

      if (user) {
        const createdAt = nowDate();
        const sessionToken = newSessionToken();
        const absoluteExpiry = computeAbsoluteExpiry(createdAt);
        const slidingExpiry = computeSlidingExpiry(createdAt, absoluteExpiry);

        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires: slidingExpiry,
          },
        });

        t.sub = user.id;
        t.role = (user as { role?: string }).role ?? "MEMBRE";
        t.sessionStartedAt = now;
        t.lastActivityAt = now;
        t.sessionToken = sessionToken;
        t.expired = false;
        return t;
      }

      if (!t.sub || !t.sessionToken) {
        return invalidateToken(t);
      }

      const sessionRow = await prisma.session
        .findUnique({
          where: { sessionToken: t.sessionToken },
          select: { id: true, userId: true, expires: true, createdAt: true },
        })
        .catch(() => null);

      if (!sessionRow || sessionRow.userId !== t.sub) {
        return invalidateToken(t);
      }

      const nowDt = nowDate();

      if (sessionRow.expires.getTime() <= nowDt.getTime()) {
        await prisma.session.delete({ where: { id: sessionRow.id } }).catch(() => undefined);
        return invalidateToken(t);
      }

      const absoluteExpiry = computeAbsoluteExpiry(sessionRow.createdAt);
      if (nowDt.getTime() > absoluteExpiry.getTime()) {
        await prisma.session.delete({ where: { id: sessionRow.id } }).catch(() => undefined);
        return invalidateToken(t);
      }

      const nextExpiry = computeSlidingExpiry(nowDt, absoluteExpiry);
      if (nextExpiry.getTime() !== sessionRow.expires.getTime()) {
        await prisma.session.update({
          where: { id: sessionRow.id },
          data: { expires: nextExpiry },
        });
      }

      const sessionStartedAt = parseTokenTimestamp(t.sessionStartedAt, now);
      const lastActivityAt = parseTokenTimestamp(t.lastActivityAt, now);

      const exceededAbsoluteLifetime = now - sessionStartedAt > MAX_SESSION_LIFETIME_SECONDS;
      const exceededInactivityTimeout = now - lastActivityAt > INACTIVITY_TIMEOUT_SECONDS;

      if (exceededAbsoluteLifetime || exceededInactivityTimeout) {
        return invalidateToken(t);
      }

      t.sessionStartedAt = sessionStartedAt;
      t.lastActivityAt = now;
      t.expired = false;

      return t;
    },
    async session({ session, token }) {
      const t = token as TokenWithMeta;

      if (t.expired || !t.sub) {
        // Return a session without user so server guards redirect cleanly
        delete (session as { user?: unknown }).user;
        return session;
      }

      if (session.user) {
        session.user.id = t.sub;
        session.user.role = typeof t.role === "string" ? t.role : "MEMBRE";
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}/dashboard`;
      }

      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }

      return `${baseUrl}/dashboard`;
    },
  },
};
