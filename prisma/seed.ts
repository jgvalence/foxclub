import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.warn("🦊 Starting Fox Club database seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { pseudo: "admin" },
    update: {},
    create: {
      pseudo: "admin",
      email: "admin@foxclub.com",
      firstName: "Admin",
      lastName: "Fox",
      password: adminPassword,
      role: "ADMIN",
      types: [],
      approved: true,
      emailVerified: new Date(),
    },
  });

  console.warn("✅ Created admin user:", admin.pseudo);

  // Create approved demo user
  const userPassword = await hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { pseudo: "demo_user" },
    update: {},
    create: {
      pseudo: "demo_user",
      email: "user@foxclub.com",
      firstName: "Demo",
      lastName: "User",
      password: userPassword,
      role: "USER",
      types: ["ETUDIANT"],
      approved: true,
      emailVerified: new Date(),
    },
  });

  console.warn("✅ Created approved demo user:", user.pseudo);

  // Create pending user (waiting for approval)
  const pendingPassword = await hash("pending123", 12);
  const pendingUser = await prisma.user.upsert({
    where: { pseudo: "pending_user" },
    update: {},
    create: {
      pseudo: "pending_user",
      email: "pending@foxclub.com",
      firstName: "Pending",
      lastName: "User",
      password: pendingPassword,
      role: "USER",
      types: ["SOUMIS"],
      approved: false,
      emailVerified: new Date(),
    },
  });

  console.warn("✅ Created pending user:", pendingUser.pseudo);

  // Create Question Families with TYPE_1 questions
  const type1Families = [
    {
      label: "Bougies / cire chaude",
      questions: [
        "Basse température",
        "Moyenne température",
        "Haute température",
      ],
    },
    {
      label: "Massages",
      questions: [
        "Massage sensuel",
        "Massage tantrique",
        "Massage avec huiles",
      ],
    },
    {
      label: "Pinces",
      questions: ["Pinces à tétons", "Pinces à clitoris", "Pinces à lèvres"],
    },
  ];

  for (const familyData of type1Families) {
    const family = await prisma.questionFamily.upsert({
      where: {
        id: `type1-${familyData.label.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        label: familyData.label,
        type: "TYPE_1",
        order: type1Families.indexOf(familyData),
      },
    });

    for (const questionText of familyData.questions) {
      await prisma.question.upsert({
        where: {
          id: `q-${family.id}-${questionText.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          text: questionText,
          questionFamilyId: family.id,
          order: familyData.questions.indexOf(questionText),
        },
      });
    }

    console.warn(
      `✅ Created TYPE_1 family: ${family.label} with ${familyData.questions.length} questions`
    );
  }

  // Create Question Families with TYPE_2 questions
  const type2Families = [
    {
      label: "Pratiques spéciales",
      questions: ["Jeux de rôle", "Photographie érotique", "Exhibitionnisme"],
    },
    {
      label: "Jouets",
      questions: ["Vibromasseurs", "Plugs anaux", "Menottes"],
    },
  ];

  for (const familyData of type2Families) {
    const family = await prisma.questionFamily.upsert({
      where: {
        id: `type2-${familyData.label.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        label: familyData.label,
        type: "TYPE_2",
        order: type1Families.length + type2Families.indexOf(familyData),
      },
    });

    for (const questionText of familyData.questions) {
      await prisma.question.upsert({
        where: {
          id: `q-${family.id}-${questionText.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          text: questionText,
          questionFamilyId: family.id,
          order: familyData.questions.indexOf(questionText),
        },
      });
    }

    console.warn(
      `✅ Created TYPE_2 family: ${family.label} with ${familyData.questions.length} questions`
    );
  }

  // Create a demo form for the approved user with some answers
  const userForm = await prisma.userForm.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      submitted: false,
    },
  });

  // Add a sample answer
  const firstQuestion = await prisma.question.findFirst();
  if (firstQuestion) {
    await prisma.formAnswer.upsert({
      where: {
        formId_questionId: {
          formId: userForm.id,
          questionId: firstQuestion.id,
        },
      },
      update: {},
      create: {
        formId: userForm.id,
        questionId: firstQuestion.id,
        score: 2,
        top: true,
        bot: false,
        talk: true,
        notes: "Exemple de note sur une pratique",
      },
    });
  }

  console.warn("✅ Created demo form with sample answer");

  // Create admin note on demo user
  await prisma.adminNote.create({
    data: {
      userId: user.id,
      adminId: admin.id,
      content: "Utilisateur de démonstration - profil complet et actif",
      pinned: true,
    },
  });

  console.warn("✅ Created admin note");

  console.warn("🎉 Fox Club seed completed successfully!");
  console.warn("");
  console.warn("📝 Login credentials (pseudo / password):");
  console.warn("   Admin: admin / admin123");
  console.warn("   User:  demo_user / user123");
  console.warn("   Pending: pending_user / pending123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
