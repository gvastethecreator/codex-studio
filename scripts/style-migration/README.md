# Retired legacy style pack migration

Monolithic style pack YAML is retired. This folder remains only as a historical marker for the old migration location. It must not contain YAML.

Normal preset authoring lives in:

```txt
components/recipes/styles/manifests/presets/<pack_id>/<PRESET_ID>.yaml
```

Do not add new presets here. `styles:source:verify` fails if YAML files appear here or if YAML files reappear in the retired `components/recipes/styles/packs/` directory.
