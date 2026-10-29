/* ==========================================================================
   DESIGN SYSTEM COMPARISON — EDITABLE CONTENT
   --------------------------------------------------------------------------
   Where to make changes:

   1. IMAGES ......... Replace the paths in IMAGE_1 / IMAGE_2, or drop new
                       files into the assets/ folder using the same names.
   2. CONTENT ........ Edit the DESIGN_SYSTEMS array below: names, copy,
                       image paths, typography and palette colors.
   ========================================================================== */

/* Image 1 — the supplied Untitled-1024.jpg reference. The -preview files are
   4:5 crops used in the cards; the -1024 file is the full frame shown in the
   Preview dialog. Keep the width/height values in sync if you swap images. */
const IMAGE_1 = {
  preview: "assets/untitled-preview-1024.jpg",
  previewSmall: "assets/untitled-preview-640.jpg",
  full: "assets/untitled-1024.jpg",
  width: 1024,
  height: 1280,
  fullHeight: 4756,
  alt: "IronCore design system reference showing the hero, typography and color palette.",
};

/* Image 2 — the supplied av-1024.jpg reference. */
const IMAGE_2 = {
  preview: "assets/av-preview-1024.jpg",
  previewSmall: "assets/av-preview-640.jpg",
  full: "assets/av-1024.jpg",
  width: 1024,
  height: 1280,
  fullHeight: 5015,
  alt: "daisyUI design system reference showing the hero, typography and color palette.",
};

const DESIGN_SYSTEMS = [
  {
    id: "a",
    label: "Design System A",
    name: "IronCore",
    tagline: "Bold, strong and energetic.",
    description:
      "A high-contrast fitness system built to feel fast and forceful. Red drives action, heavy type carries the energy, and slate keeps the structure grounded.",
    systemColor: "#e53935",
    image: IMAGE_1,
    imageLabel: "Image 1",
    typography: {
      family: "Roboto",
      stack: "'Roboto', Arial, sans-serif",
      sample: "Train with intent.",
      body: "Push past the ordinary with a system built for motion, strength and focus.",
      scale: [
        { tag: "H1", size: "2.55rem", text: "Train hard" },
        { tag: "H2", size: "1.9rem", text: "Build strength" },
        { tag: "H3", size: "1.45rem", text: "Every rep counts" },
        { tag: "H4", size: "1.15rem", text: "Recover smarter" },
      ],
      weights: ["Light 300", "Regular 400", "Medium 500", "Bold 700"],
    },
    buttonExamples: [
      { label: "Primary", variant: "primary" },
      { label: "Outline", variant: "outline" },
    ],
    palette: {
      source:
        "Based on colors sampled from the supplied reference. Shade values follow the reference ramps.",
      colors: [
        { name: "Primary", hex: "#e53935", light: "#f37e7e", dark: "#8a1515" },
        { name: "Secondary", hex: "#6b7280", light: "#9ca3af", dark: "#374151" },
        { name: "Success", hex: "#008000", light: "#93c693", dark: "#004900" },
        { name: "Warning", hex: "#ffce18", light: "#f9e6a0", dark: "#92760e" },
        { name: "Error", hex: "#ef4444", light: "#f3a5a5", dark: "#5c0e0e" },
        { name: "Info", hex: "#0000ee", light: "#9797f2", dark: "#00005b" },
      ],
    },
  },
  {
    id: "b",
    label: "Design System B",
    name: "daisyUI",
    tagline: "Light, clean and friendly.",
    description:
      "A light, friendly system for a Tailwind CSS product. Violet leads, pink adds warmth, and generous type sizes keep the interface approachable.",
    systemColor: "#422ad5",
    image: IMAGE_2,
    imageLabel: "Image 2",
    typography: {
      family: "Noto Sans",
      stack: "'Noto Sans', 'Noto Sans JP', system-ui, sans-serif",
      sample: "Build with ease.",
      body: "A calm, flexible foundation for product teams shipping thoughtful interfaces.",
      scale: [
        { tag: "H1", size: "2.55rem", text: "Design faster" },
        { tag: "H2", size: "1.9rem", text: "Ship with confidence" },
        { tag: "H3", size: "1.45rem", text: "A theme for every idea" },
        { tag: "H4", size: "1.15rem", text: "Simple by default" },
      ],
      weights: ["Light 300", "Regular 400", "Medium 500", "Bold 700"],
    },
    buttonExamples: [
      { label: "Primary", variant: "primary" },
      { label: "Secondary", variant: "secondary" },
    ],
    palette: {
      source:
        "Based on colors sampled from the supplied reference. Shade values follow the reference ramps.",
      colors: [
        { name: "Primary", hex: "#422ad5", light: "#ada4e8", dark: "#1a1155" },
        { name: "Secondary", hex: "#f43098", light: "#f4a9d1", dark: "#5d123a" },
        { name: "Success", hex: "#008000", light: "#93c693", dark: "#004900" },
        { name: "Warning", hex: "#ffce18", light: "#f9e6a0", dark: "#92760e" },
        { name: "Error", hex: "#f12525", light: "#f3a5a5", dark: "#5c0e0e" },
        { name: "Info", hex: "#0000ee", light: "#9797f2", dark: "#00005b" },
      ],
    },
  },
];

/* Exposed for comparison.js. */
window.DESIGN_SYSTEM_COMPARISON = {
  defaultView: "both",
  systems: DESIGN_SYSTEMS,
};
