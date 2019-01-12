module.exports = class EffectContainer {

    /**
     * @param containerName [string} название текущего контейнера. Должно быть уникальным
     * Рекомендуется использовать название пакета + название контейнера:
     * vtact-core/PixelEffectsContainer
     * vtact-web/WebPixelEffectContainer
     */
    constructor(containerName){
        this.$containerName = containerName;
    }

    /**
     * Это имя вшивается вместе с метаинфой в эффект
     * @return {string}
     */
    getContainerName(){
        return this.$containerName
    }

    /**
     * Вшивает в функцию данные об эффекте (метаинформацию).
     * @param effectFunction - функция
     * @param effectName - название эффекта
     * @param params - параметры, с которыми создан эффект
     * @return {*}
     */
    withEffectMeta(effectFunction, effectName, params){
        effectFunction.effectMeta = {
            container: this.$containerName,
            name: effectName,
            params: params,
        };
        return effectFunction
    }

    /**
     * Получение эффекта по метаинформации
     * @param effectName
     * @param params
     */
    getEffectByMeta(effectName, params){
        throw new Error("getEffect function of EffectContainer should be overrided")
    }
};