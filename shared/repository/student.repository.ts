import { prisma } from "config/prisma-client";
import { NotFoundError } from "errors";
import { redisClient } from "config/redis-client";

export class StudentRepository {
  getStudent = async (studentId: string) => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundError("No student found for record id");
    return student;
  };

  getStudentByUserId = async (userId: string) => {
    const student = await prisma.student.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            field: true,
            email: true,
            userType: true,
            level: true,
            isEmailVerified: true,
            isAgreementAccepted: true,
            needEmailNotification: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        category: true,
        studentSkills: {
          include: { skill: true },
        },
        education: true,
        workExperience: true,
        profileSummary: true,
        validIdUpload: true,
        studentNyscUpload: true,
        studentProfile: true,
        refereeDetails: true,
        guarantorDetails: true,
        professionalOverview: true,
        certificateAchievements: true,
      },
    });
    if (!student) throw new NotFoundError("Student not found");
    return student;
  };

  getCachedStudentByUserId = async (userId: string) => {
    const data = await redisClient.get(`student-${userId}`);
    return data ? JSON.parse(data) : null;
  };

  setCachedStudentByUserId = async (userId: string) => {
    const student = await this.getStudentByUserId(userId);
    if (student) {
      await redisClient.set(`student-${userId}`, JSON.stringify(student));
    }
  };

  getStudents = async () => {
    return await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            field: true,
            email: true,
            userType: true,
            level: true,
            isEmailVerified: true,
            isAgreementAccepted: true,
            needEmailNotification: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  };
}
