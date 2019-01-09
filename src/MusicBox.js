// ToDo лучше продумать работу данного класса
module.exports.MusicBox = class MusicBox {
    constructor(){
        this.$tactifiers = [];
        this.$tactifierBridges = [];
    }

    setTactifiers(tactifiers) {
        if (tactifiers.find(tt => !tt.duration)) {
            throw new Error("Can't create chain with tactifier that haven't length");
        }
        for(let i = 0; i < this.$tactifierBridges.length-1; i++) {
            tactifiers[i].off(this.$tactifierBridges[i])
        }
        for (let i = 0; i < tactifiers.length-1; i++) {
            const bridgeFn = () => {
                tactifiers[i+1].start(0);
            };
            this.$tactifierBridges.push(bridgeFn);
            tactifiers[i].on("end", bridgeFn)
        }
        this.$tactifiers = tactifiers;
    }

    start(timeFromMs){
        timeFromMs = timeFromMs || 0;
        let time = 0;
        let tactifierIndex = 0;
        while (time < timeFromMs) {
            time += this.$tactifiers[tactifierIndex].duration;
            tactifierIndex++;
        }
        time -= this.$tactifiers;
        tactifierIndex--;
        this.$tactifiers
    }
}