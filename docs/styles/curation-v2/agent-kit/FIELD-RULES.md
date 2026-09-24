# Field authoring rules and interpretation risks

## Separate the original instructions first

Before editing, classify each original instruction as a visual mechanism, transformation target, thematic content, output format, discovery reference, or example. A sentence may combine roles. Adding `transferable`, `any subject`, or `no fixed scene` does not resolve contradictory instructions later in a field.

For a portable derivative, preserve the requested subject, action, setting, and text. For a selected profile or theme, record what additional decisions the user authorized. If a proposal conflicts with an explicit lock, preserve the lock and report the incompatibility. Do not invent a semantic parser to conceal an editorial conflict.

### Cultures, mythologies, and X-punk aesthetics

Selecting one of these directions also selects its characteristic visual vocabulary. Removing a mandatory scene must not remove that vocabulary. Steampunk may use bronze, functional gears, and steam; a Norse direction may use interlaced beasts, carved wood, and metal fittings. Apply these elements to design decisions left open by the request, with a clear function and hierarchy. The user need not request every characteristic again.

Preserve subject identity, action, and explicit constraints. Treating every unspecified detail as locked reduces cultures to palettes and aesthetics to textures. Do not replace the subject with a stock scene, alter a person's ethnicity, or attach unrelated symbols. A Norse motorcycle can remain a motorcycle; it need not become a Viking ship.

Keep Mythic Noir's cultures and mythologies distinct. Keep each Punk Spectrum X-punk identity recognizable; changing only weather, color, or material does not establish another style. A representative card should show a complete composition that expresses that identity. Review the definition, subject transfer, and representative image separately.

## The eight fields

### `aesthetic`

Define the medium and dominant mechanism. Useful: “Ink relief with solid masses and carved gaps.” Risky: “Sacred ruins with knights.” Explain how shapes and values are made. Ruins belong to a requested thematic direction, not an unrequested appearance treatment.

### `subject_treatment`

Explain how existing forms translate: simplification, contours, authorized proportions, and internal detail. Do not insert “one girl,” “warrior holding,” or an occupation. If the preset intentionally changes anatomy or wardrobe, classify that transformation explicitly; do not describe it as neutral preservation.

### `color_and_tone`

Define value and color relationships, accents, and saturation. A red accent does not require blood. Distinguish a fixed palette that defines a profile from a flexible palette. Resolve conflict with requested colors in the contract instead of issuing incompatible instructions.

### `lighting_and_shadow`

Describe source direction, size, hardness, shadow grouping, and light response. Do not invent a window, physical neon, or sunset. A selected light modifier may change lighting, but not the setting by association. Do not call a result “physically accurate” without verification.

### `texture_and_material`

Describe scale, distribution, and behavior. Retain concrete material identity when it is the target: oak, glass, or felt can be essential. Remove unrequested sample scenes, not the material. Choose the relevant mechanism instead of demanding growth, erosion, fracture, polish, and melting at once. Distinguish pigment applied to an image from wood represented in an object.

### `camera_and_composition`

For an appearance treatment, respect the requested camera and organization while preserving legibility. For a profile, retain its selected projection, scale, or layout. Do not demand side view, isometric view, and top view at once. In preserve mode, do not reintroduce composition through `aesthetic`, `subject_treatment`, or `atmosphere_and_mood` when the camera field is disabled.

### `atmosphere_and_mood`

Express feeling through rhythm, tension, contrast, and space. “Solemn” need not add a funeral; “strange” need not add an empty corridor. Do not use this field as a hidden list of props, lore, events, or characters. A theme may carry explicit narrative, but its classification must disclose that scope.

### `rendering_and_quality`

Define observable finish: edge hierarchy, controlled detail, shadow bands, plane separation, or coherent grain. Empty labels such as “masterpiece,” “8K,” and “high quality” cannot replace a description. “Heavy denoise” is not proof of an actual provider parameter. Do not erase the preset's technique to impose a generic finish.

## Negatives, permissions, and metadata

Inspect `avoidRules`, `attributes.negativePrompt`, and policy rules when present. Do not prohibit `text` when the case requests PAUSA or `illustration` when combined with a drawn style. Do not delete negatives globally; identify the conflict and its scope. Negative rules cannot compensate for positive fields that keep adding an unwanted scene.

Keep useful aliases and references in metadata for discovery, but do not automatically put them in the prompt. Metadata isolation does not remove references already written in active visual fields. Inspect the effective prompt and newly saved blends.

Short names are navigation labels. Use a concrete distinguishing descriptor without inventing technique, history, or a quality promise. A visual rename must not change `id`, `packId`, category keys, or favorite references.

The current policy contract uses `requires` as one permission or `null`, not an arbitrary list. Available permissions include `structure`, `wardrobe`, `design`, `environment`, `materialTarget`, and `accent`. Confirm the current contract before editing. If a proposal needs a combination the architecture cannot express, escalate it; do not claim compatibility.

## Keep, derive, group, or propose archive

Keep a preset with a recognizable function, even when specialized. Derive when preserving the visual mechanism while changing theme, camera, or scope; retain the original. Propose a variant when only one dimension appears to differ, but inspect negatives, medium, permissions, and results first. Propose archive when there is no useful distinction and a reviewed alternative exists.

Zero identical DNA groups does not prove semantic uniqueness. Similar images do not prove equivalent behavior. Similar labels do not prove duplication. Record candidate A, candidate B, the proposed distinction, subjects compared, actual evidence, and pending decision.

Do not deploy archive or redirect logic or migrate favorites during an editorial task. The PR does not implement that lifecycle. A written proposal is not an applied operation.

## Before-and-after examples

[`examples.json`](examples.json) contains twelve cases linked to source files. `before` is the field value in the hashed source. `after` is an instructional proposal for one field, not a complete manifest. `wrongFix` names the shortcut to avoid. Do not copy a pigment example to a sensor or a portable-derivative correction to a profile that must retain its camera.

If a hash changes, reread the source. Do not regenerate hashes to make an old reference appear reviewed. New versions need their own evidence and status.
