module.exports.gain = function gain(color, gain) {
    return color.map(x => x*gain)
};

module.exports.getFadeColor = function gain(colorA, colorB, state) {
    return colorA.map((v,i) => {
        return v + (colorB[i]-v)*state
    })
};