// Example community plugin for FLABLETON.
// Load it from the Devices panel: "Load community plugin from URL..." and enter
// the URL of this file (when running the dev server: http://localhost:5173/plugins/tremolo.js).
export default {
  manifest: {
    id: "community.example.tremolo",
    name: "Tremolo",
    vendor: "Example",
    version: "1.0.0",
    kind: "effect",
    description: "Volume wobble synced to nothing in particular - a starting point for your own plugin.",
    params: [
      { key: "rate", label: "Rate", min: 0.1, max: 20, default: 5, log: true, unit: "Hz" },
      { key: "depth", label: "Depth", min: 0, max: 1, default: 0.6, unit: "%" },
      { key: "shape", label: "Shape", min: 0, max: 1, default: 0, step: 1, choices: ["Sine", "Square"] },
    ],
    presets: [{ name: "Helicopter", params: { rate: 14, depth: 1, shape: 1 } }],
  },
  create(ctx, params) {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    input.connect(output);
    lfo.connect(depth).connect(output.gain);
    lfo.start();
    const set = (key, v) => {
      if (key === "rate") lfo.frequency.value = v;
      if (key === "depth") {
        depth.gain.value = v / 2;
        output.gain.value = 1 - v / 2;
      }
      if (key === "shape") lfo.type = v >= 0.5 ? "square" : "sine";
    };
    for (const [k, v] of Object.entries(params)) set(k, v);
    return { input, output, setParam: set, dispose: () => (lfo.stop(), input.disconnect(), output.disconnect()) };
  },
};
