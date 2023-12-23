import { type } from "os"


export type ExperienceLevel = "BEGINNERS" | "EXPERIENCED" | "EXPERIENCED"

export type ITLoginPayload = {
    email: string
    password: string
}

export type ITokenPayload = {
    userId: string,
    email: string
}