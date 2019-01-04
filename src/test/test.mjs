import {Tactifier} from "../Tactifier";


console.log("press key to start");
process.stdin.on('data', key => {
    start();
});

const start = () => {
    const tactifier = new Tactifier(150, {debug: true, beatCount: 40});
    tactifier.addEffect(0,5,(beat) => {
        console.log("Beating at beat",beat);
    });
    tactifier.start();
    tactifier.on("end",() => console.log("tactifier end"));
    console.log("start!");
};
