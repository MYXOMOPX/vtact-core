const colorUtils = require("../utils/color-utils");
const EffectContainer = require("../EffectContainer");

module.exports = class PixelEffectContainer extends  EffectContainer{
    /**
     * @param countOfPixels {number} - количество пикселей.
     * @param [containerName] {string} - название контейнера.
     */
    constructor(countOfPixels, containerName){
        super(containerName || "vtact-core/PixelEffectContainer");
        this.$array = new Uint8Array(countOfPixels*3)
    }

    /**
     * Делает все пиксели черными.
     * Заполняет массив нулями
     */
    clear(){
        this.$array.fill(0);
    }

    /**
     * Возвращает массив, над которыми выполняеются все эффекты
     * @return {Uint8Array}
     */
    getArray(){
        return this.$array;
    }

    getEffectByMeta(name,params){
        const func = this["effect_"+name];
        if (!func) return null;
        return this["effect_"+name](...params)
    }

    /**
     * Просто задает пикселю цвет.
     * @param color {array} [r,g,b]
     * @param positions {number|array<number>} positions of pixels
     * @returns {function} effect-function
     */
    effect_set(color,positions){
        if (typeof positions === "number") positions = [positions];
        const e_set = (beat, eff) => {
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                this.$array[pos*3] = color[0];
                this.$array[pos*3+1] = color[1];
                this.$array[pos*3+2] = color[2];
            }
        };
        return this.withEffectMeta(e_set,"set",[color,positions])
    }
    /**
     * Просто задает пикселю цвет.
     * @param colorFrom {array} [r,g,b]
     * @param colorTo {array} [r,g,b]
     * @param squared (boolean) квадратичная функция переливания
     * @param positions {number|array<number>} positions of pixels
     * @returns {function} effect-function
     */
    effect_fade(colorFrom,colorTo,squared,positions){
        if (typeof positions === "number") positions = [positions];
        const e_fade = (beat, eff) => {
            let state = (beat-eff.startBeat)/(eff.endBeat-eff.startBeat);
            if (squared) state = state*state;
            const color = colorUtils.getFadeColor(colorFrom,colorTo,state);
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                this.$array[pos*3] = color[0];
                this.$array[pos*3+1] = color[1];
                this.$array[pos*3+2] = color[2];
            }
        };
        return this.withEffectMeta(e_fade,"fade",[colorFrom,colorTo,squared,positions])
    }
    /**
     * Переливание из черного в заданный цвет
     * Сахар для effect_fade([0,0,0],...)
     * @param color {array} [r,g,b]
     * @param squared (boolean) квадратичная функция переливания
     * @param positions {number|array<number>} positions of pixels
     * @returns {function} effect-function
     */
    effect_fadein(color,squared,positions){
        return this.effect_fade([0,0,0],color,squared,positions)
    }
    /**
     * Переливание из черного в заданный цвет
     * Сахар для effect_fade([0,0,0],...)
     * @param color {array} [r,g,b]
     * @param squared (boolean) квадратичная функция переливания
     * @param positions {number|array<number>} positions of pixels
     * @returns {function} effect-function
     */
    effect_fadeout(color,squared,positions){
        return this.effect_fade(color,[0,0,0],squared,positions)
    }
};