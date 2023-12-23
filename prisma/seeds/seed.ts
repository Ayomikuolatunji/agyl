// seeders.js
import { prisma } from "../../config/prisma-client";

async function seedUserTypes() {
  try {
    const userTypesToSeed = [
      {
        name: "Student",
        description: "Student user type",
      },
      {
        name: "Facilitator",
        description: "Facilitator user type",
      },
      {
        name: "Admin",
        description: "Admin user type",
      },
      {
        name: "Service Provider",
        description: "Service Provider user type",
      },
    ];
    for (const userType of userTypesToSeed) {
      const createdUserType = await prisma.userType.upsert({
        where: {
          name: userType.name,
        },
        update: userType,
        create: userType,
      });
      console.log(
        `UserType with ID ${createdUserType.id} seeded successfully.`
      );
    }
  } catch (error) {
    console.error("Error seeding UserType:", error);
  }
}

async function seedFieldOfInterests() {
  try {
    const fieldsToSeed = [
      {
        name: "Software Engineering",
      },
      {
        name: "Data Science",
      },
      {
        name: "Web Development",
      },
    ];

    for (const field of fieldsToSeed) {
      const createdField = await prisma.fieldOfInterest.upsert({
        where: { name: field.name },
        update: {
          name: field.name,
        },
        create: field,
      });

      console.log(
        `FieldOfInterest with ID ${createdField.id} seeded successfully.`
      );
    }
  } catch (error) {
    console.error("Error seeding FieldOfInterest:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedStudentCategory() {
  try {
    const studentCategory = [
      {
        name: "Self Paid",
      },
      {
        name: "Sponsored",
      },
    ];
    studentCategory.map(async (category) => {
      await prisma.studentCategory.upsert({
        where: { name: category.name },
        update: { name: category.name },
        create: category,
      });
    });
  } catch (error) {
    console.log("Error occurred seeding StudentCategory", error);
  }
}

async function seedSkills() {
  try {
    const skills = [
      {
        name: "HTML",
      },
      {
        name: "CSS",
      },
      {
        name: "Javascript",
      },
      {
        name: "Typescript",
      },
      {
        name: "React.js",
      },
      {
        name: "Next.js",
      },
      {
        name: "Figma",
      },
      {
        name: "Node.js",
      },
    ];

    skills.map(async (skill) => {
      await prisma.skill.upsert({
        where: { name: skill.name },
        update: { name: skill.name },
        create: skill,
      });
    });
  } catch (err) {
    console.log("Error occured seeding skill", err);
  }
}

async function seedMedicalConditions() {
  try {
    const medicalConditionsData = [
      { name: "Diabetes" },
      { name: "Asthma" },
      { name: "Hypertension" },
      { name: "Cancer" },
      { name: "Allergies" },
      { name: "Arthritis" },
      { name: "Depression" },
      { name: "Migraine" },
      { name: "Obesity" },
      { name: "Chronic pain" },
    ];

    for (const medicalConditionData of medicalConditionsData) {
      await prisma.medicalCondition.create({
        data: medicalConditionData,
      });
    }

    console.log("Medical conditions seeding completed successfully!");
  } catch (error) {
    console.error("Error occurred during medical conditions seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedGenotypes() {
  try {
    const genotypesData = [
      { name: "AA" },
      { name: "AS" },
      { name: "SS" },
      { name: "AC" },
      { name: "CC" },
      { name: "DD" },
      { name: "EE" },
      { name: "FF" },
      { name: "GG" },
      { name: "HH" },
    ];

    for (const genotypeData of genotypesData) {
      await prisma.genotype.create({
        data: genotypeData,
      });
    }

    console.log("Genotypes seeding completed successfully!");
  } catch (error) {
    console.error("Error occurred during genotypes seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seed() {
  await seedFieldOfInterests();
  await seedUserTypes();
  await seedStudentCategory();
  await seedSkills();
  await seedMedicalConditions();
  await seedGenotypes();
}

seed();
