import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert User One
  const userOne = await prisma.user.upsert({
    where: { name: "userOne" },
    update: {},
    create: {
      name: "userOne",
    },
  });

  // Upsert Plugin One
  const pluginOne = await prisma.plugin.upsert({
    where: { name: "pluginOne" },
    update: {},
    create: {
      name: "pluginOne",
      description: "Description for pluginOne",
    },
  });

  // Upsert Plugin Two
  const pluginTwo = await prisma.plugin.upsert({
    where: { name: "pluginTwo" },
    update: {},
    create: {
      name: "pluginTwo",
      description: "Description for pluginTwo",
    },
  });

  // Insert UserPlugin relationship for userOne with pluginOne
  await prisma.userPlugin.upsert({
    where: {
      userId_pluginId: {
        userId: userOne.id,
        pluginId: pluginOne.id,
      },
    },
    update: {},
    create: {
      userId: userOne.id,
      pluginId: pluginOne.id,
    },
  });

  // Insert UserPlugin relationship for userOne with pluginTwo
  await prisma.userPlugin.upsert({
    where: {
      userId_pluginId: {
        userId: userOne.id,
        pluginId: pluginTwo.id,
      },
    },
    update: {},
    create: {
      userId: userOne.id,
      pluginId: pluginTwo.id,
    },
  });

  // Upsert Categories for Plugin One
  const categoryOnePluginOne = await prisma.category.upsert({
    where: {
      categoryIdentifier: {
        pluginId: pluginOne.id,
        name: "categoryOne",
      },
    },
    update: {},
    create: {
      name: "categoryOne",
      pluginId: pluginOne.id,
    },
  });

  const categoryTwoPluginOne = await prisma.category.upsert({
    where: {
      categoryIdentifier: {
        pluginId: pluginOne.id,
        name: "categoryTwo",
      },
    },
    update: {},
    create: {
      name: "categoryTwo",
      pluginId: pluginOne.id,
    },
  });

  // Upsert Subcategory for Category One of Plugin One
  const subcategoryOne = await prisma.category.upsert({
    where: {
      categoryIdentifier: {
        pluginId: pluginOne.id,
        name: "subcategoryOne",
      },
    },
    update: {},
    create: {
      name: "subcategoryOne",
      parentCategoryId: categoryOnePluginOne.id,
      pluginId: pluginOne.id,
    },
  });

  // Upsert Categories for Plugin Two
  const categoryOnePluginTwo = await prisma.category.upsert({
    where: {
      categoryIdentifier: {
        pluginId: pluginTwo.id,
        name: "categoryOne",
      },
    },
    update: {},
    create: {
      name: "categoryOne",
      pluginId: pluginTwo.id,
    },
  });

  // Upsert Presets for Plugin One - Category One - Subcategory One
  await prisma.preset.upsert({
    where: {
      presetIdentifier: {
        categoryId: subcategoryOne.id,
        name: "presetOne",
      },
    },
    update: {},
    create: {
      name: "presetOne",
      description: "Description for presetOne",
      version: 1,
      categoryId: subcategoryOne.id,
    },
  });

  await prisma.preset.upsert({
    where: {
      presetIdentifier: {
        categoryId: subcategoryOne.id,
        name: "presetTwo",
      },
    },
    update: {},
    create: {
      name: "presetTwo",
      description: "Description for presetTwo",
      version: 1,
      categoryId: subcategoryOne.id,
    },
  });

  // Upsert Presets for Plugin One - Category Two
  await prisma.preset.upsert({
    where: {
      presetIdentifier: {
        categoryId: categoryTwoPluginOne.id,
        name: "presetThree",
      },
    },
    update: {},
    create: {
      name: "presetThree",
      description: "Description for presetThree",
      version: 1,
      categoryId: categoryTwoPluginOne.id,
    },
  });

  // Upsert Presets for Plugin Two - Category One
  await prisma.preset.upsert({
    where: {
      presetIdentifier: {
        categoryId: categoryOnePluginTwo.id,
        name: "presetOne",
      },
    },
    update: {},
    create: {
      name: "presetOne",
      description: "Description for presetOne",
      version: 1,
      categoryId: categoryOnePluginTwo.id,
    },
  });

  console.log({
    pluginOne,
    pluginTwo,
    categoryOnePluginOne,
    categoryTwoPluginOne,
    subcategoryOne,
    categoryOnePluginTwo,
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
