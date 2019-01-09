const Tactifier = require("../index").Tactifier;


console.log("press key to start");
process.stdin.on('data', key => {
    start();
});

const start = () => {
    const tactifier = new Tactifier(150, {debug: true, duration: 5000});
    tactifier.addEffect(0,5,(beat) => {
        console.log("Beating at beat",beat);
    });
    tactifier.start();
    tactifier.on("end",() => console.log("tactifier end"));
    console.log("start!");
};
