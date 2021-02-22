import { Replayer, unpack, mirror } from "rrweb";
window.Replayer = Replayer;

// import "rrweb/dist/rrweb.min.css";

//import events from "./events.json";

// const replayer = new Replayer(events, {
//   // speed,
//   // root: frame,
//   // unpackFn: unpack,
//   // ...$$props,
// });

// const goto = (timeOffset) => {
//   replayer.play(timeOffset);
//   replayer.pause();
// };

// const startTime = events[0].timestamp;
// const endTime = events[events.length - 1].timestamp;

// setTimeout(() => {
//   waitForReplayer(() => {
//     goto(endTime - startTime);
//   });
// }, 100);

// function waitForReplayer(cb) {
//   const frame = document.querySelector("iframe");
//   if (!frame) {
//     setTimeout(() => {
//       waitForReplayer(cb);
//     }, 100);
//   }
//   return cb();
// }
