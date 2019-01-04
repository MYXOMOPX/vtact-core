import {TactifierAlreadyStartedError, TactifierNotStartedError} from "./error/TactifierErrors";
import {EventEmitter} from "events";

export class Tactifier {

    /**
     * @param bpm {number} ударов в секунду
     * @param settings {Object} - настройки тактифайера
     * @param settings.tactCheckIn {number} - раз в сколько миллисекунд будут обрабатываться эффекты
     * @param settings.debug {boolean} - режим отладки
     * @param settings.beatCount {number} - количество битов, после которого закончить
     * @param settings.offsetMs {number} - количество миллисекунд до начала музыки
     */
    constructor(bpm,settings){
        if (!settings) settings = {};
        this.$bpm = bpm; // ударов в минуту
        this.$bpms = bpm/60000; // ударов в миллисекунду
        this.$offsetMs = settings.offsetMs || 0;
        this.$beatCount = settings.beatCount || null;
        this.$tactCheckIn = settings && settings.tactCheckIn ? settings.tactCheckIn : 50;
        this.$debug = settings && settings.debug ? settings.debug : false;
        this.$started = false; // статус тактифайера
        this.$startOffsetMs = 0; // Миллисекунда с которой начали
        this.$effects = [];

        // Делаем Tactifier emitter'ом
        this.$eventEmitter = new EventEmitter();
        this.on = this.$eventEmitter.on.bind(this.$eventEmitter);
        this.off = this.$eventEmitter.off.bind(this.$eventEmitter);
        this.$emit = this.$eventEmitter.emit.bind(this.$eventEmitter);
    }

    /**
     * Добавляет эффект
     * @param beatFrom - с какого бита будет работать эффект
     * @param beatTo - до какого бита будет работать эффект
     * @param effectFn - функция эффекта
     * @param priority - приоритет
     * Чем выше приоритет, тем раньше сработает эффект. Дефолтный приоритет 50.
     * @returns {Object} effect - эффект, необходим для removeEffect
     */
    addEffect(beatFrom, beatTo, effectFn, priority) {
        const effect = createTactifierEffect(beatFrom, beatTo,effectFn, priority);
        this.$effects.push(effect);
        return effect;
    }
    /**
     * Удаляет эфеект
     * @param effect - эффект, созданный при вызове addEffect
     */
    removeEffect(effect) {
        const arr = this.$effects;
        arr.splice(arr.indexOf(effect),1);
    }

    /**
     * Стартует тактифайер
     * @param timeFromMs - время, с которого начать
     * По умолчанию - 0.
     */
    start(timeFromMs){
        if (this.$started) {
            throw new TactifierAlreadyStartedError();
        }
        timeFromMs = timeFromMs || 0;
        this.$startOffsetMs = timeFromMs;
        this.$startDate = Date.now();
        this.$started = true;
        this.$tactInterval = setInterval(this.$tick.bind(this),this.$tactCheckIn);
        this.$emit("start",timeFromMs);
    }

    /**
     * Остановить тактифайер
     */
    stop(){
        if (!this.$started) {
            throw new TactifierNotStartedError();
        }
        clearInterval(this.$tactInterval);
        this.$started = false;
    }

    /**
     * Передвинуть тактифайер
     * @param timeMs время на которогое передвинуть
     * По факту останавливает тактифайер, и стартует его с timeMs
     */
    moveTo(timeMs){
        this.$emit("moveTo",timeMs);
        this.stop();
        this.start(timeMs);
    }

    $tick(){
        const musicTime = Date.now() - this.$startDate - this.$offsetMs + this.$startOffsetMs;
        const currentBeat = musicTime*this.$bpms;
        if (this.$debug) console.log("$tick",currentBeat,musicTime);
        if (this.$beatCount && this.$beatCount <= currentBeat) {
            this.stop();
            this.$emit("end");
        }
        this.$effects
                     .filter(ef => ef.startBeat <= currentBeat && ef.endBeat > currentBeat) // Только те, что уже начались и не закончились
                     .sort((ef1, ef2) => ef2.priority - ef1.priority) // Desc-сортировка по приоритету
                     .forEach(effect => {
                         effect.fn.call(effect,currentBeat,effect);
                     })
    }
}

function createTactifierEffect(startBeat,endBeat,fn,priority) {
    const effect = Object.create(null);
    effect.startBeat = startBeat;
    effect.endBeat = endBeat;
    effect.fn = fn;
    effect.priority = priority || 50;
    return effect
}
