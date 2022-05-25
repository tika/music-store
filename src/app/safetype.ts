import { User } from ".prisma/client";

export type SafeUser = Omit<User, "email" | "password">;

export function sanitise(user: User[]): SafeUser[];
export function sanitise(user: User): SafeUser;
export function sanitise(user: User | User[]) {
    if (Array.isArray(user)) {
        return user.map((u) => {
            const { email, password, ...useful } = u;
            return useful;
        });
    }

    const { email, password, ...useful } = user;
    return useful;
}