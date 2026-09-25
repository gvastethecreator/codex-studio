import type { Create, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';
import { dna } from './_strict';

// Neon, net and signal punks (part B): eight more information-technology punks.
const AVOID = [...STYLE_AVOID, 'real brand or company logo', 'readable interface text'];

const punk = (
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof dna>[0],
  briefs: [string, string, string],
): Create => ({
  name,
  domain,
  tags: [tag, 'punk', 'signal'],
  dna: dna(fields),
  avoid: AVOID,
  briefs,
});

const spec: Spec = {
  pack: 'pack_15',
  category: '2. Neon, Net & Signal Punks',
  updates: {},
  creates: [
    punk(
      'Surveillancepunk',
      'watched city punk',
      'surveillance',
      {
        aesthetic:
          'Surveillancepunk: a city of cameras on every corner, scanning lasers, facial-recognition halos and people inventing ways to hide in plain sight.',
        subject_treatment:
          "Keep the prompt's subject and setting; place cameras, scan beams and tracking halos around it, and give people small tricks for hiding.",
        color_and_tone:
          'Cold grey concrete, camera-lens black and red tracking lights with pale green scan lines.',
        lighting_and_shadow:
          'Harsh security floodlights, red camera LEDs and thin laser scan lines across faces.',
        texture_and_material:
          'Dome cameras, lens glass, reflective anti-scan fabrics, face paint and concrete.',
        camera_and_composition:
          'Fish-eye security-camera angles and street views crowded with lenses.',
        atmosphere_and_mood:
          'Paranoid and defiant, a constant game of hide and seek with the whole city.',
        rendering_and_quality:
          'Crisp illustration with sharp lens reflections and clean scan-line effects.',
        key_features: 'dome cameras; scan lines; tracking halos; camouflage makeup',
      },
      [
        "A whole plaza of protesters wears mirrored masks that reflect every security camera back at itself, and the city's scanning lasers sweep across them in confusion under the floodlights. No readable text or logo.",
        "A cat has learned to sit exactly in the blind spot of every camera on the street and is now the neighborhood's most trusted smuggler. No readable text or logo.",
        'Through a fish-eye security view of an empty hallway at 3 a.m., a figure made only of shadow stands where no camera can see it. No readable text or logo.',
      ],
    ),
    punk(
      'Serverpunk',
      'data center punk',
      'serverpunk',
      {
        aesthetic:
          'Serverpunk: people living inside colossal data centers, among humming rack canyons, cooling fog, cable rivers and blinking status lights.',
        subject_treatment:
          "Keep the prompt's subject and setting; place it among server racks, cable trays and cooling fog, with blinking lights as the environment.",
        color_and_tone:
          'Cold steel grey and deep blue with thousands of tiny green, amber and blue status lights.',
        lighting_and_shadow:
          'Blinking rack lights in darkness, cold aisle blue and warm aisle amber.',
        texture_and_material:
          'Perforated steel racks, cable trays, raised floor tiles and condensation fog.',
        camera_and_composition:
          'Endless aisle perspectives and tall vertical canyons of racks rising into darkness.',
        atmosphere_and_mood:
          'Humming and cold, a hidden world that never sleeps while everyone else does.',
        rendering_and_quality:
          'Precise illustration with deep perspective and countless small lights.',
        key_features: 'rack canyons; status lights; cooling fog; cable rivers',
      },
      [
        'A nomad tribe lives inside an abandoned data center the size of a mountain, their tents pitched between humming server canyons and their children fishing in the coolant river under a sky of blinking status lights. No readable text or logo.',
        'A sysadmin in slippers chases a runaway maintenance robot down endless rack aisles at 4 a.m., both clearly exhausted. No readable text or logo.',
        'Deep in a silent server hall, one rack still blinks a steady heartbeat pattern after the whole building was shut down. No readable text or logo.',
      ],
    ),
    punk(
      'Screenpunk',
      'giant screen city punk',
      'screenpunk',
      {
        aesthetic:
          'Screenpunk: a city of giant screens where building facades are displays, faces loom across towers and people live in the glow.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with huge glowing screens and let their color spill over everything.",
        color_and_tone:
          'Saturated screen colors spilling over dark streets, faces tinted by whatever the screens show.',
        lighting_and_shadow:
          'Screen light as the dominant source, shifting colors on wet surfaces and faces.',
        texture_and_material:
          'Visible pixel grids up close, glass towers, wet asphalt and umbrellas.',
        camera_and_composition: 'Tiny people below colossal screen faces and pixel close-ups.',
        atmosphere_and_mood:
          'Overwhelming and mesmerizing, a city that is always watching you back.',
        rendering_and_quality: 'Vivid illustration with glowing screens and pixel grid detail.',
        key_features: 'building-sized screens; spilled screen color; pixel grids; tiny people',
      },
      [
        'Every building-sized screen in the city suddenly shows the same giant sleeping face, and a crowd of thousands stands in the rain below trying not to wake it. No readable text or logo.',
        'A window cleaner abseiling down a giant screen tower is accidentally broadcast in close-up across the whole skyline, waving shyly. No readable text or logo.',
        'A power cut leaves one small screen glowing in a dark plaza, showing a quiet forest to a single homeless dog. No readable text or logo.',
      ],
    ),
    punk(
      'Laserpunk',
      'laser light culture punk',
      'laserpunk',
      {
        aesthetic:
          'Laserpunk: a culture of visible laser beams, where fences, locks, art and duels are made of light cutting through haze.',
        subject_treatment:
          "Keep the prompt's subject and setting; cut sharp laser beams through haze around it as barriers, tools or weapons.",
        color_and_tone: 'Deep haze black with razor-thin red, green and violet beams.',
        lighting_and_shadow:
          'Beams as the only sharp light, glowing where they pass through smoke or dust.',
        texture_and_material: 'Haze, mirrors, prisms, glossy black surfaces and beam scorch marks.',
        camera_and_composition:
          'Geometric grids of beams crossing the frame with figures threading through.',
        atmosphere_and_mood: 'Sharp and dangerous, every movement measured against lines of light.',
        rendering_and_quality: 'High-contrast illustration with crisp beams and soft haze glow.',
        key_features: 'visible beams; haze; mirrors and prisms; beam grids',
      },
      [
        'A cat burglar dances through a vault crossed by hundreds of laser beams while an orchestra in the gallery above plays the exact rhythm she needs to survive. No readable text or logo.',
        'A retired laser duelist uses his beam sword only to slice bread at a village bakery, customers ducking every morning. No readable text or logo.',
        'In a dusty desert shrine, a single laser beam has been bouncing between the same mirrors for a thousand years. No readable text or logo.',
      ],
    ),
    punk(
      'Capsulepunk',
      'micro-dwelling punk',
      'capsulepunk',
      {
        aesthetic:
          'Capsulepunk: people living in stacked capsule pods, micro-apartments and sleeping walls, making whole lives inside tiny glowing boxes.',
        subject_treatment:
          "Keep the prompt's subject and setting; compress it into stacked pods and tiny rooms, with personal clutter filling every inch.",
        color_and_tone:
          'Plastic white and pale grey pods with warm personal lights and colorful clutter.',
        lighting_and_shadow:
          'Rows of small pod lights, each a different color, in a dark corridor wall.',
        texture_and_material:
          'Molded plastic pods, curtains, ladders, sticky notes and tiny appliances.',
        camera_and_composition:
          'Grid walls of pods seen head-on and cramped interiors from inside.',
        atmosphere_and_mood: 'Cramped and tender, big lives squeezed into small glowing boxes.',
        rendering_and_quality: 'Detailed illustration with a grid of individual lit pods.',
        key_features: 'stacked pods; tiny lit interiors; ladders; personal clutter',
      },
      [
        'A wall of five hundred capsule pods lights up one by one as residents open their hatches to watch a whale swim past the flooded tower window at dawn. No readable text or logo.',
        'A man has fit a full grand piano into his capsule pod and plays it lying on his back while neighbors bang on the walls. No readable text or logo.',
        'An empty capsule pod is still perfectly kept, its lamp on and a plant watered, though no one has slept there in years. No readable text or logo.',
      ],
    ),
    punk(
      'Hackerspacepunk',
      'maker collective punk',
      'hackerspace',
      {
        aesthetic:
          'Hackerspacepunk: cluttered maker collectives where soldering irons, 3D printers, salvaged robots and all-night projects fill warehouse workshops.',
        subject_treatment:
          "Keep the prompt's subject and setting; surround it with half-built projects, tools, circuit boards and people making things.",
        color_and_tone:
          'Warm workshop amber with green circuit boards, colored wires and cool monitor glow.',
        lighting_and_shadow: 'Clamp lamps, monitor glow and soldering sparks in a dim warehouse.',
        texture_and_material:
          'Circuit boards, spools of filament, pegboards of tools, duct tape and salvage.',
        camera_and_composition: 'Busy workshop views with many projects in different stages.',
        atmosphere_and_mood:
          'Chaotic and hopeful, a community building the future out of junk at 3 a.m.',
        rendering_and_quality:
          'Dense detailed illustration where every tool and half-built project stays readable.',
        key_features: 'soldering glow; half-built robots; tool pegboards; salvage',
      },
      [
        'A maker collective works all night to finish a giant robot built from shopping carts and washing machines before the city demolishes their warehouse at dawn, sparks everywhere and bulldozers visible through the windows. No readable text or logo.',
        'A grandmother at a hackerspace proudly unveils a knitting machine that now knits sweaters for pigeons. No readable text or logo.',
        'Alone in the dark workshop, an unfinished robot switches itself on and tidies the soldering station. No readable text or logo.',
      ],
    ),
    punk(
      'Overlaypunk',
      'augmented reality punk',
      'overlaypunk',
      {
        aesthetic:
          'Overlaypunk: a world seen through augmented reality, where floating icons, virtual creatures and painted-on skins cover a shabby real city.',
        subject_treatment:
          "Keep the prompt's subject and setting; layer floating wordless overlays, virtual creatures and bright skins over the real scene.",
        color_and_tone:
          'Dull real-world greys and browns under bright candy-colored virtual overlays.',
        lighting_and_shadow:
          'Real daylight or streetlight, with overlays glowing flatly without real shadows.',
        texture_and_material: 'Flat glowing virtual shapes floating over worn real surfaces.',
        camera_and_composition: 'Split views where overlays and reality misalign at the edges.',
        atmosphere_and_mood: 'Playful and hollow, a beautiful illusion painted over a tired world.',
        rendering_and_quality:
          'Clean illustration contrasting flat virtual layers with detailed reality.',
        key_features:
          'floating overlays; virtual creatures; misaligned edges; dull reality beneath',
      },
      [
        'A glitch drops every augmented-reality skin in the city at once, and a crowd of shoppers freezes as their glittering castle mall turns back into a grey parking garage full of virtual dragons that no longer have anything to perch on. No readable text or logo.',
        'A man walks his virtual dog through the park while real pigeons stare in confusion at the empty leash. No readable text or logo.',
        'A child takes off her overlay glasses and sees, for the first time, the real sky above the city. No readable text or logo.',
      ],
    ),
    punk(
      'Maglevpunk',
      'magnetic transit punk',
      'maglevpunk',
      {
        aesthetic:
          'Maglevpunk: a city stitched together by floating magnetic trains, silent rails through buildings and sky-high stations.',
        subject_treatment:
          "Keep the prompt's subject and setting; run silent floating trains and glowing rails through or past it.",
        color_and_tone: 'Sleek white and silver with glowing blue rail lines against dusk skies.',
        lighting_and_shadow:
          'Glowing rail strips, streaking train lights and reflective station glass.',
        texture_and_material:
          'Smooth composite train shells, magnetic rails, glass stations and concrete pylons.',
        camera_and_composition:
          'Sweeping curves of elevated rails and trains frozen mid-glide through the city.',
        atmosphere_and_mood: 'Silent and swift, a city that moves without a sound.',
        rendering_and_quality: 'Sleek illustration with smooth curves and luminous rail lines.',
        key_features: 'floating trains; glowing rails; sky stations; silent speed',
      },
      [
        'A maglev train glides silently straight through the middle of a skyscraper at dusk, office workers inside waving at passengers as it passes through their floor. No readable text or logo.',
        'A heron has built its nest on the glowing rail and the entire maglev network waits politely while it finishes. No readable text or logo.',
        'A last train floats alone above a flooded city at night, its windows lit and no driver aboard. No readable text or logo.',
      ],
    ),
  ] satisfies Create[],
};

export default spec;
