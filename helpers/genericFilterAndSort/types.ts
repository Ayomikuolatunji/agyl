import { Prisma } from "@prisma/client";

export type GenericWhereType = Prisma.StudentWhereInput | Prisma.ServiceProviderWhereInput | Prisma.AdminWhereInput

export type GenericIncludeType = Prisma.StudentInclude | Prisma.ServiceProviderInclude |  Prisma.AdminInclude | undefined

