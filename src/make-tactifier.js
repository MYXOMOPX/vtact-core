const Tactifier = require("./Tactifier");

/**
 * TactifierSave {
 *      bpm: number,
 *      settings: {...},
 *      effects: [EffectSave]
 * }
 *
 * EffectSave {
 *      startBeat: number,
 *      endBeat: number,
 *      effectMeta: EffectMeta,
 *      priority: number
 * }
 *
 * EffectMeta {
 *      container: string,
 *      name: string,
 *      params: [*],
 * }
 */
module.exports.serializeTactifier = function serializeTactifier(tactifier, saveSettings=true) {
    const tObj = Object.create(null);
    tObj.bpm = tactifier.$bpm;
    if (saveSettings) tObj.settings = tactifier.$settings;
    tObj.effects = tactifier.$effects.map(effect => {
        return {
            startBeat: effect.startBeat,
            endBeat: effect.endBeat,
            priority: effect.priority,
            effectMeta: {
                container: effect.fn.effectMeta.container,
                name: effect.fn.effectMeta.name,
                params: effect.fn.effectMeta.params
            }
        }
    });
    return JSON.stringify(tObj)
};

const registeredContainers = {};
module.exports.registerContainer = function (container) {
    registeredContainers[container.$containerName] = container
};
module.exports.unregisterContainer = function (container) {
    delete registeredContainers[container.$containerName]
};

module.exports.deserializeTactifier = function createTactifierFromJSON(json) {
    const tObj = JSON.parse(json);
    const settings = tObj.settings;
    const bpm = tObj.bpm;
    const tactifier = new Tactifier(bpm, settings);
    tObj.effects.forEach(effectData => {
        const ctrName = effectData.effectMeta.container;
        const effectMeta = effectData.effectMeta;
        const container = registeredContainers[ctrName];
        if (!container) {
            console.warn("Effect '"+effectMeta.name+"' has unknown container: '"+effectMeta.container+"'. Skipping.");
            return;
        }
        const effect = container.getEffectByMeta(effectMeta.name,effectMeta.params);
        if (!effect) {
            console.warn("Can't instantiate effect '"+effectMeta.name+"' of container '"+effectMeta.container+"'. Skipping.");
            return;
        }
        tactifier.addEffect(effectData.startBeat,effectData.endBeat,effect,effectData.priority)
    });
    return tactifier;
};
