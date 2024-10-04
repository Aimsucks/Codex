import { z } from 'zod'; // updatePluginAction form data _validation

// updatePluginAction form data _validation

const pluginIconMaximumFileSize = 1024 * 1024 * 4; // 4 MB
const pluginIconAcceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];

// Options from /components/ui/multi-select.tsx
export const pluginPermissionsOptionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

// Something to explore in the future:
// https://www.codu.co/articles/validate-an-image-file-with-zod-jjhied8p

// Provides the ability to use the same schema server-side and client-side
const fileSchema = () => {
    return typeof window === 'undefined'
        ? z.instanceof(File).optional()
        : z
              .instanceof(FileList)
              .optional()
              .transform((fileList) => {
                  if (fileList) return fileList[0];
              });
};

export const pluginUpdateFormSchema = z.object({
    description: z.string().max(300).optional().or(z.literal('')),
    icon: fileSchema()
        .refine(
            (file) => !file || file.size <= pluginIconMaximumFileSize,
            `Maximum image size is ${pluginIconMaximumFileSize / 1024 / 1024} MB`
        )
        .refine(
            (file) =>
                !file ||
                file.size === 0 ||
                pluginIconAcceptedFileTypes.includes(file.type),
            'Only .jpg, .jpeg, and .png formats are supported'
        ),
    githubLink: z.string().url().optional().or(z.literal('')),
    discordLink: z.string().url().optional().or(z.literal('')),
    approvedUsers: z.array(pluginPermissionsOptionSchema).optional(),
});
