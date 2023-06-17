import { compare as compareAsync, hash as hashAsync } from "bcryptjs";

const saltOrRounds = 10;

export const hash = (data: string) => hashAsync(data, saltOrRounds);

export const compare = (data: string, hash: string) => compareAsync(data, hash);
