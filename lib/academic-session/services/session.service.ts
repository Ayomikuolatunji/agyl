import { AcademicSession } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { BadRequestError, NotFoundError } from "errors";

export class SessionService {
  public createAcademicSession = async (body: AcademicSession) => {
    const sessionExists = await prisma.academicSession.findFirst({
      where: {
        yearSession: body.yearSession,
      },
    });
    if (sessionExists) throw new BadRequestError("Session already created");

    await prisma.academicSession.create({
      data: {
        ...body,
      },
    });
  };

  public updateAcedemicSession = async (body: AcademicSession) => {
    const session = await prisma.academicSession.findUnique({
      where: { id: body.id },
    });

    if (!session)
      throw new NotFoundError("No academic session found for record id");

    await prisma.academicSession.update({
      where: { id: body.id },
      data: { ...body },
    });
  };

  public getAcademicSessions = async () => {
    return await prisma.academicSession.findMany();
  };
}
