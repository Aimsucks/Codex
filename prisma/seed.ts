import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

    /*
    Users
     */

    const user = await prisma.user.upsert({
        where: {name: 'Aimsucks'},
        update: {},
        create: {
            name: 'Aimsucks',
            image: 'https://cdn.discordapp.com/avatars/111202303070969856/e9efe871a44408f944ae7ec418eed55f.png',
            isAdmin: true,
        },
    });

    /*
    Plugins
     */

    const plugin = await prisma.plugin.upsert({
        where: {name: "Codex Example"},
        update: {},
        create: {
            name: 'Codex Example',
            description: 'Providing an example of interacting with a repository of presets for FFXIV home.',
            icon: 'https://github.com/Aimsucks/CodexExample/blob/master/Assets/icon.png?raw=true',
        },
    });

    /*
    Users - Plugins
     */

    await prisma.userPlugin.upsert({
        where: {
            userId_pluginId: {
                userId: user.id,
                pluginId: plugin.id,
            },
        },
        update: {},
        create: {
            userId: user.id,
            pluginId: plugin.id,
        },
    });

    /*
    Categories
     */

    const configCategory = await prisma.category.upsert({
        where: {categoryIdentifier: {pluginId: plugin.id, name: "Configuration Presets"}},
        update: {},
        create: {
            name: 'Configuration Presets',
            pluginId: plugin.id
        },
    });

    const pluginCategory = await prisma.category.upsert({
        where: {categoryIdentifier: {pluginId: plugin.id, name: "Plugin Presets"}},
        update: {},
        create: {
            name: 'Plugin Presets',
            pluginId: plugin.id
        },
    });

    const interfaceCategory = await prisma.category.upsert({
        where: {categoryIdentifier: {pluginId: plugin.id, name: "Interface Presets"}},
        update: {},
        create: {
            name: 'Interface Presets',
            pluginId: plugin.id,
            parentCategoryId: pluginCategory.id,
        },
    });

    const moduleCategory = await prisma.category.upsert({
        where: {categoryIdentifier: {pluginId: plugin.id, name: "Module Presets"}},
        update: {},
        create: {
            name: 'Module Presets',
            pluginId: plugin.id,
            parentCategoryId: pluginCategory.id,
        },
    });

    /*
    Presets
     */

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: configCategory.id, name: 'True / 30'}},
        update: {},
        create: {
            name: 'True / 30',
            description: 'Changes Setting 1 to True and Setting 2 to 30.',
            version: 1,
            categoryId: configCategory.id,
            pluginId: plugin.id,
            data: '{"SettingOne": true, "SettingTwo": 30}',
        },
    });

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: configCategory.id, name: 'False / 20'}},
        update: {},
        create: {
            name: 'False / 20',
            description: 'Changes Setting 1 to False and Setting 2 to 20.',
            version: 1,
            categoryId: configCategory.id,
            pluginId: plugin.id,
            data: '{"SettingOne": false, "SettingTwo": 20}',
        },
    });

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: pluginCategory.id, name: 'General Preset'}},
        update: {},
        create: {
            name: 'General Preset',
            version: 1,
            categoryId: pluginCategory.id,
            pluginId: plugin.id,
            data: '{"Name": "General Preset", "StringData": "String Data 3", "IntData": 30}',
        },
    });

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: interfaceCategory.id, name: 'Int. Preset 1'}},
        update: {},
        create: {
            name: 'Int. Preset 1',
            version: 1,
            categoryId: interfaceCategory.id,
            pluginId: plugin.id,
            data: '{"Name": "Int. Preset 1", "StringData": "String Data 1", "IntData": 10}',
        },
    });

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: interfaceCategory.id, name: 'Int. Preset 2'}},
        update: {},
        create: {
            name: 'Int. Preset 2',
            version: 1,
            categoryId: interfaceCategory.id,
            pluginId: plugin.id,
            data: '{"Name": "Int. Preset 2", "StringData": "String Data 2", "IntData": 20}',
        },
    });

    await prisma.preset.upsert({
        where: {presetIdentifier: {categoryId: moduleCategory.id, name: 'Mod. Preset'}},
        update: {},
        create: {
            name: 'Mod. Preset',
            version: 2,
            categoryId: moduleCategory.id,
            pluginId: plugin.id,
            data: '{"Name": "Mod. Preset", "StringData": "String Data 4", "IntData": 40}',
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
