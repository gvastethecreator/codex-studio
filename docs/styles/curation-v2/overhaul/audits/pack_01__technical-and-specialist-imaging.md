# pack_01 :: 7. Technical And Specialist Imaging — audit

Audited 2026-09-25 from the contact sheet (12 primaries + 2 variants) and full manifests.

## Category-wide defects

- All 12 DNA blocks were the router template with a shared "diagnostic capture constraints, device-specific signal, evidence clarity …" filler.
- The review asks to separate transferable signals (thermal color) from capture profiles (a CCTV overlay needs the profile); the old DNA did neither and demanded "surveillance UI burn-in" while forbidding fake UI text.
- Cards: a road cyclist again (SP01-074), a wet city road (SP01-027), an empty station (SP01-025), a generic galaxy (SP01-030) nearly identical to SP01-054 in Nature.
- Name collision: SP01-028 "Thermal Camera" has the same name as SP02-059 in Sensor And Technical Imaging.

## Per-preset card defects

| Preset                 | Card defect                                               |
| ---------------------- | --------------------------------------------------------- |
| SP01-025 CCTV          | empty station platform, no subject                        |
| SP01-027 Dashcam       | wet city road at dusk (trope)                             |
| SP01-028 Thermal       | walking figure; palette correct                           |
| SP01-029 SEM           | pollen grain reads well                                   |
| SP01-030 Telescope     | generic spiral galaxy, same as SP01-054                   |
| SP01-058 Minimalist    | blue chair; variant is a camera sensor product shot       |
| SP01-059 Abstract      | rain on glass; acceptable                                 |
| SP01-072 Tilt-Shift    | town from above; works                                    |
| SP01-073 Long Exposure | waterfall; works, generic                                 |
| SP01-074 Brenizer      | road cyclist (trope); variant generic redhead on a bridge |
| SP01-076 Forensic      | door lock with scale; acceptable                          |
| SP01-077 Medical       | gloved hand with forceps; acceptable                      |

## Changes

- DNA rewritten for all 12 (version 2). CCTV, dashcam, Brenizer, forensic and medical declare what they own (viewpoint or documentation framing); thermal and long exposure are signal modifiers that keep any framing. Every overlay is required to stay unreadable.
- Renamed SP01-028 to **Ironbow Thermal Imaging** (its defining palette), leaving "Thermal Camera" to pack_02.
- SP01-030 now means space-telescope narrowband false color (gold and teal, multi-spike stars); SP01-054 in Nature owns natural-color amateur deep-sky.
- SP01-059 Abstract Photo states that it abstracts the subject on purpose (camera movement, crop, reflection), which is its function.
- 3 new briefs per preset, no subject repeated in the category.
- New presets (pending cards): Schlieren Photography, Photoelastic Stress Imaging, Slit-Scan Photo Finish, Chronophotography Sequence, Tiny Planet Stereographic, UV Fluorescence Photography, Kirlian Corona Photography, Borescope Inspection. Category now 20.
- Coordination note: sensor outputs (sonar, radar, MRI, lidar, satellite) are left for pack_02::7, pack_03::8 and pack_11::6 so the four technical categories do not duplicate each other.
- Overlap: SP01-073 Long Exposure (Water) is a modifier for any moving water; SP01-121 Long-Exposure Seascape in Nature is a coastal composition. Both kept.

## Pending (local session)

- Generate the `--card-set` cards; check that CCTV and dashcam overlays stay unreadable.
