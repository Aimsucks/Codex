import { z } from 'zod';

export const presetFormSchema = z.object({
    name: z.string().min(1).max(75),
    description: z.string().max(300).optional().or(z.literal('')),
    data: z.string().min(1),
});
