import { Prisma, PrismaClient } from "@prisma/client";
import {
  GenericIncludeType,
  GenericWhereType,
} from "helpers/genericFilterAndSort/types";

interface FilterAndSortOptions {
  pageSize: number;
  currentPage: number;
}


export class GenericFilterAndSort {
  private prisma: any;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async filterAndSort(
    query: FilterAndSortOptions,
    model: Prisma.ModelName,
    where: GenericWhereType,
    include: GenericIncludeType,
    orderBy: any
  ) {
    const { pageSize, currentPage } = query;
    const offset = this.calculateOffset(currentPage, pageSize);
    const [results, totalCount] = await Promise.all([
      this.queryResults(model, orderBy, where, include, pageSize, offset),
      this.queryTotalCount(model, where),
    ]);
    const totalPages = this.calculateTotalPages(totalCount, pageSize);
    return { totalPages, results };
  }

  private calculateOffset(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize;
  }
  private async queryResults(
    model: Prisma.ModelName,
    orderBy: any,
    where: GenericWhereType,
    include: GenericIncludeType,
    pageSize: number,
    offset: number
  ) {
    return await this.prisma[model].findMany({
      orderBy,
      where,
      take: pageSize,
      skip: offset,
      include,
    });
  }
  private async queryTotalCount(model: Prisma.ModelName, where: GenericWhereType) {
    return await this.prisma[model].count({ where });
  }
  private calculateTotalPages(totalCount: number, pageSize: number) {
    return Math.ceil(totalCount / pageSize);
  }
}
