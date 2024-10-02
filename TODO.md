# To-do List

## Short-term

- Develop a basic front-end so people can log in and create/update presets for their plugins.
- When creating presets, have a "Save and Add Another" button to make it faster to add new ones.
- Limit the front-end to only work with authenticated creators so the design can be simpler.
- Add form validation for preset saving, maybe convert it into an actual form.

## Medium-term

- Give preset descriptions markdown and multi-line support.
- Provide an endpoint to check for "any presets updated since XYZ date" so plugins can store a date and feed it into the
  API if they want to present users a list of the updated presets since their last visit.
- Provide an update endpoint that receives preset IDs and version numbers for each one, so I can do the version check
  processing on my end, saving bandwidth for plugins that have _a lot_ of presets.
- Mimic the functionality of the GitHub file browser for presets so there can be descriptions, separators, and ordering,
  for categories, subcategories, presets, etc.

## Long-term

- Change the versioning model to support rolling back presets or selecting a preset version when importing. This would
  have to change either the way presets are unique inside the presets table or it would mean a new table has to be
  created to store the preset versions. This might be better to implement only on the web UI considering it would be
  annoying to implement in-game.
- Add permissions per-preset and per-category so plugin authors can determine who can edit their presets.
