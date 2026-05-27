/**
 * One-time backfill: recalculate recommendation scores for every student
 * with an existing CV, so the new analyzer's weighted breakdown is persisted.
 *
 * Usage:
 *   cd backend && node scripts/recalc_all_scores.js
 */
const prisma = require("../src/config/prisma");
const { recalculateScoresForStudent } = require("../src/services/recommendation.service");

async function main() {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      cvs: { some: {} },
    },
    select: { id: true, email: true },
  });

  console.log(`Backfilling scores for ${students.length} student(s) with CVs...`);

  let done = 0;
  for (const student of students) {
    try {
      await recalculateScoresForStudent(student.id);
      done += 1;
      console.log(`[${done}/${students.length}] ${student.email}`);
    } catch (error) {
      console.error(`Failed for ${student.email}:`, error.message);
    }
  }

  console.log("Backfill complete.");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
