import z from 'zod';
import { partial } from "zod/mini";

export const createGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    member_emails: z.array(z.email("Invalid email format")).min(1, "At least one member email is required"),
});

export const updateGroupSchema = partial(createGroupSchema);



