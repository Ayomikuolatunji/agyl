import { prisma } from "config/prisma-client";
import { RequestHandler } from "express";
import { Country, State, City } from "country-state-city";
import { StatusCodes } from "http-status-codes";
import { successHandler } from "middlewares/res/success-handler";

export class StaticSeededData {
  public AllStaticData: RequestHandler = async (req, res, next) => {
    const userType = await prisma.userType.findMany({});
    const skills = await prisma.skill.findMany({});
    const studentCategory = await prisma.studentCategory.findMany({});
    const fieldOfInterest = await prisma.fieldOfInterest.findMany({});
    const medicalConditions = await prisma.medicalCondition.findMany({});
    const genotypes = await prisma.genotype.findMany({});
    const academicSessions = await prisma.academicSession.findMany({});
    successHandler(res, {
      statusCode: StatusCodes.OK,
      message: "Okay",
      data: {
        userType,
        skills,
        studentCategory,
        fieldOfInterest,
        medicalConditions,
        genotypes,
        academicSessions,
      },
    });
  };
  public locations: RequestHandler = async (req, res, next) => {
    try {
      const countries = Country.getAllCountries();
      const countriesWithStatesAndCities = countries.map((country) => ({
        ...country,
        states: State.getStatesOfCountry(country.isoCode),
      }));
      const countriesWithStatesCitiesAndCitiesInStates =
        countriesWithStatesAndCities.map((country) => ({
          ...country,
          states: country.states.map((state) => ({
            ...state,
            cities: City.getCitiesOfState(country.isoCode, state.isoCode),
          })),
        }));
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Locations retrieved successfully",
        data: countriesWithStatesCitiesAndCitiesInStates,
      });
    } catch (error) {
      next(error);
    }
  };
}
