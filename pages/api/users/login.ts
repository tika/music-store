import {
  AuthorizationError,
  NotFoundError,
  InvalidBodyError,
} from "../../../app/error";
import { createEndpoint } from "../../../app/endpoint";
import { JWT } from "../../../app/jwt";
import { loginSchema } from "../../../schemas/userschema";
import { prisma } from "../../../app/prisma";
import argon2 from "argon2";
import { sanitise } from "../../../app/safetype";

export default createEndpoint({
  POST: async (req, res) => {
    const { name, password } = loginSchema.parse(req.body);
    if (!name) throw new InvalidBodyError("email or username");

    const user = await prisma.user.findFirst({ where: { name } });

    if (!user) throw new NotFoundError("user");

    if (!(await argon2.verify(user.password as string, password)))
      throw new AuthorizationError("user");

    const jwt = new JWT(sanitise(user));
    const token = jwt.sign();

    res.setHeader("Set-Cookie", JWT.cookie(token));

    res.json({ token });
  },
});
