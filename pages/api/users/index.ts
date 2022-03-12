import { createEndpoint } from "../../../app/endpoint";
import { NotFoundError, AuthorizationError, ConflictError } from "../../../app/error";
import {
    deleteSchema,
    registerSchema,
    updateSchema,
} from "../../../schemas/userschema";
import argon2 from "argon2";
import { JWT } from "../../../app/jwt";
import { prisma } from "../../../app/prisma";
import { sanitise } from "../../../app/safetype";

export default createEndpoint({
    GET: async (req, res) => {
        const user = await prisma.user.findFirst({
            where: { id: parseInt(req.query.id as string) },
        });

        if (!user) throw new NotFoundError("user");

        res.json(sanitise(user));
    },
    POST: async (req, res) => {
        const { name, email, password } = registerSchema.parse(req.body);

        let newUser;
        try {
            const hashedPassword = await argon2.hash(password);
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
        } catch (e) {
            throw new ConflictError("user", "details");
        }

        const jwt = new JWT(sanitise(newUser));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", JWT.cookie(token));

        res.json({ token });
    },
    PATCH: async (req, res) => {
        const user = JWT.parseRequest(req);
        const { name, email, newPassword, password } = updateSchema.parse(req.body);

        if (!user) throw new NotFoundError("user");

        const fullUser = await prisma.user.findFirst({ where: { id: user.id } });

        if (!(await argon2.verify(fullUser!.password as string, password)))
            throw new AuthorizationError("user");

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name, email, password: newPassword },
        });

        res.json(sanitise(updatedUser));
    },
    DELETE: async (req, res) => {
        const user = JWT.parseRequest(req);
        const { password } = deleteSchema.parse(req.body);

        if (!user) throw new NotFoundError("user");

        const fullUser = await prisma.user.findFirst({ where: { id: user.id } });

        if (!(await argon2.verify(fullUser!.password as string, password)))
            throw new AuthorizationError("user");

        await prisma.user.delete({ where: { id: user.id } });

        res.setHeader("Set-Cookie", JWT.logoutCookie());

        res.json({ message: `Deleted account ${user.id}` });
    },
});
