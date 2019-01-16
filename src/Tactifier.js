const TactifierAlreadyStartedError = require("./error/TactifierErrors").TactifierAlreadyStartedError
const EventEmitter = require("events").EventEmitter;

module.exports =  class Tactifier {

    /**
     * @param bpm {number} ударов в секунду
     * @param settings {Object} - настройки тактифайера
     * @param settings.debug {boolean} - режим отладки
     * @param settings.duration {number} - количество миллисекунд, после которого закончить. Должен включать offsetMs, если он есть.
     * @param settings.offsetMs {number} - количество миллисекунд до начала музыки
     */
    constructor(bpm,settings){
        if (!settings) settings = {};
        this.$settings = settings; // Для облегчения сериализации.
        this.$bpm = bpm; // ударов в минуту
        this.$bpms = bpm/60000; // ударов в миллисекунду
        this.$offsetMs = settings.offsetMs || 0;
        this.duration = settings.duration || null;
        this.$debug = settings && settings.debug ? settings.debug : false;
        this.$started = false; // статус тактифайера
        this.$startOffsetMs = 0; // Миллисекунда с которой начали
        this.$effects = [];

        // Делаем Tactifier emitter'ом
        this.$eventEmitter = new EventEmitter();
        this.on = this.$eventEmitter.addListener.bind(this.$eventEmitter);
        this.off = this.$eventEmitter.removeListener.bind(this.$eventEmitter);
        this.$emit = this.$eventEmitter.emit.bind(this.$eventEmitter);
    }

    get isStarted(){
        return this.$started;
    }

    get currentMusicTime(){
        return Date.now() - this.$startDate - this.$offsetMs + this.$startOffsetMs;
    }

    /**
     * Добавляет эффект
     * @param beatFrom {number} - с какого бита будет работать эффект
     * @param beatTo {number|null} - до какого бита будет работать эффект
     * @param effectFn {function} - функция эффекта
     * @param [priority] {number} - приоритет
     * Чем выше приоритет, тем раньше сработает эффект. Дефолтный приоритет 50.
     * Если нет аргумента beatTo, тогда эффект перестанет выполняться, когда вернет что-либо касующееся в true
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
        this.$effects.forEach(eff => {
            delete eff.stopped;
        });
        this.$emit("start",timeFromMs);
    }

    /**
     * Остановить тактифайер
     */
    stop(){
        if (!this.$started) {
            return
        }
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

    /**
     * Обработать текущий момент.
     * Должен запускаться только во включенном состоянии.
     */
    tick(){
        if (!this.isStarted) return;
        const musicTime = Date.now() - this.$startDate - this.$offsetMs + this.$startOffsetMs;
        const currentBeat = musicTime*this.$bpms;
        if (this.$debug) console.log("tick",currentBeat,musicTime);
        if (this.duration && this.duration <= (musicTime+this.$offsetMs)) {
            this.stop();
            this.$emit("end",musicTime,currentBeat);
            return;
        }
        this.$effects
                     .filter(ef => ef.startBeat <= currentBeat && ef.endBeat > currentBeat ** !ef.stopped) // Только те, что уже начались и не закончились
                     .sort((ef1, ef2) => ef2.priority - ef1.priority) // Desc-сортировка по приоритету
                     .forEach(effect => {
                         const result = effect.fn.call(effect,currentBeat,effect);
                         if (!effect.endBeat && result) effect.stopped = true;
                     });
        this.$emit("afterTick",musicTime,currentBeat);
    }
};

function createTactifierEffect(startBeat,endBeat,fn,priority) {
    const effect = Object.create(null);
    effect.startBeat = startBeat;
    effect.endBeat = endBeat;
    effect.fn = fn;
    effect.priority = priority || 50;
    return effect
}
