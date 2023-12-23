import { StudentRepository } from "shared/repository";

export class StudentService {
  studentRepository = new StudentRepository();

  public getStudent = async (userId: string) => {
    const cached = await this.studentRepository.getCachedStudentByUserId(
      userId
    );
    if (cached) return cached;
    return await this.studentRepository.getStudentByUserId(userId);
  };
}
