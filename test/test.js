const vtact = require("../index");
const Tactifier = vtact.Tactifier;
const PixelEffectContainer = vtact.PixelEffectContainer;
const serializeTactifier = vtact.MakeTactifier.serializeTactifier;
const registerContainer = vtact.MakeTactifier.registerContainer;
const deserializeTactifier = vtact.MakeTactifier.deserializeTactifier;

console.log("press key to start");
process.stdin.on('data', key => {
    if (!tactifierJson) start();
    else startWithJson();
});

let tactifierJson;
const pixelEffects = new PixelEffectContainer(3);
registerContainer(pixelEffects);

const start = () => {
    const tactifier = new Tactifier(150, {duration: 4000, tactCheckIn: 10});
    const pixelEffects = new PixelEffectContainer(3);
    tactifier.addEffect(0,2,pixelEffects.effect_set([255,0,0],0));
    tactifier.addEffect(3,6,pixelEffects.effect_fadein([255,0,255],false,1));
    tactifier.addEffect(6,9,pixelEffects.effect_fadeout([255,0,255],true,1));

    tactifier.on("afterTick", () => {
        console.log(pixelEffects.getArray());
        pixelEffects.clear();
    });
    tactifier.start();
    tactifier.on("end",() => console.log("tactifier end",tactifierJson));
    console.log("start!");
    tactifierJson = serializeTactifier(tactifier);
};

const startWithJson = () => {
    const tactifier = deserializeTactifier(tactifierJson);
    tactifier.on("afterTick", () => {
        console.log(pixelEffects.getArray());
        pixelEffects.clear();
    });
    tactifier.start();
    tactifier.on("end",() => console.log("tactifier end (json)"));
    console.log("start (json)!");
};