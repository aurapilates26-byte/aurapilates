import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const id = "cmpuxlbuw00ijp4016pmesm29";

async function main() {
  const e = await prisma.memberPackEnrollment.findMany({
    where: { memberId: id },
    include: { pack: { select: { name: true } } },
    orderBy: { purchasedAt: "desc" },
  });
  console.log(
    "enrollments",
    e.map((x) => ({
      name: x.pack.name,
      status: x.status,
      pay: x.packPaymentId,
      purchased: x.purchasedAt.toISOString().slice(0, 10),
    })),
  );
  const m = await prisma.member.findUnique({
    where: { id },
    select: {
      packId: true,
      expectedPackAmountDinars: true,
      enrollmentStatus: true,
      pack: { select: { name: true } },
    },
  });
  console.log("member", m);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
