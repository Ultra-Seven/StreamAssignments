// you may want to copy dist.js over from the prototype code!
var Dist = require("./dist.js")
var Pred = require("./predict.js")
var fs = require("fs");


var Evaluator = (function() {

  // @fullTraces a list of mouse traces: [ trace1, trace2, ...]
  //             where trace is [ [x, y, t, action], ... ]
  function Evaluator(fullTraces) {
    this.fullTraces = fullTraces;
  };

  // @predictor a Predictor object
  // @return an accuracy score between 0 and 1, where 0 sucks, and 1 is great
  Evaluator.prototype.eval = function(predictor) {

    // TODO: do something to evaluate your predictions
    for (var traceIndex in this.fullTraces) {
      let trace = this.fullTraces[traceIndex];
      let start = Math.floor(trace.length / 2);
      //console.log("trace", trace);
      for(let i = start + 1; i < trace.length - 1; i++) {
        let base = trace.slice(0, i);
        //console.log("base:", base);
        console.log("start", trace[i]);
        let time = trace[i][2] - trace[i-1][2];
        var dist = predictor.predict(base, time);
        console.log(i, dist);
      }
    }
    return 0;
  };

  return Evaluator;
})();


console.log("Assuming you are running in src/chrome/server/");
var ktmdata = JSON.parse(fs.readFileSync("../static/data/ktmdata.json"));
//console.log(ktmdata[0]);
var traces = [];  // TODO: give it your mouse traces
traces = [[[240, 329, 499096365904, "m"], [241,329, 1499096366252, "m"]
  ,[243, 331, 1499096366273, "m"], [240, 330, 1499096366288, "d"],
  [240, 330, 1499096366426, "u"]]];
var yourPred = Pred.YourPredictor([]);
var baseline = Pred.BaselinePredictor([], ktmdata);
var eval = new Evaluator(traces);
//console.log("Your Score: " + eval.eval(yourPred));
console.log(baseline);
console.log("Base Score: " + eval.eval(baseline));


module.exports = {
  Evaluator: Evaluator
}
