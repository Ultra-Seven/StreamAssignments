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
    var accumulation = 0;
    let threshold = 20;
    // TODO: do something to evaluate your predictions
    for (var traceIndex in this.fullTraces) {
      let trace = this.fullTraces[traceIndex];
      let start = Math.floor(trace.length / 2);
      //console.log("trace", trace);
      for(let i = start + 1; i < trace.length; i++) {
        let base = trace.slice(0, i);
        //console.log("base:", base);
        let time = trace[i][2] - trace[i - 1][2];
        var distribution = predictor.predict(base, time);
        let predictPoints = distribution.getTopK(10);
        for(let pointIndex in predictPoints) {
          let point = predictPoints[pointIndex][0];
          console.log(point);
          let calX = point[0] - trace[i][0];
          let calY = point[1] - trace[i][1];
          let distance = Math.pow((calX * calX + calY * calY), 0.5);
          // if(trace[i][3] !== point[2]) {
          //   distance = distance * 2;
          // }
          accumulation = accumulation + distance * predictPoints[pointIndex][1];
          console.log("accumulation:", accumulation, "action", trace[i][3], point[2]);

        }
      }
      accumulation = accumulation / (trace.length - start - 1);
    }
    accumulation = accumulation / this.fullTraces.length;
    return accumulation > threshold ? 0 : 1;
  };

  return Evaluator;
})();

console.log("Assuming you are running in src/chrome/server/");
$.getJSON("/static/data/ktmdata.json", function(ktmdata) {
  var traces = [];  // TODO: give it your mouse traces
  traces = [[[240, 329, 1499096365904, "m"], [241,329, 1499096366252, "m"]
  ,[243, 331, 1499096366273, "m"], [240, 330, 1499096366288, "d"],
  [240, 330, 1499096366426, "u"]]];
  var yourPred = new Pred.YourPredictor([]);
  var baseline = new Pred.BaselinePredictor([], ktmdata);
  var eval = new Evaluator(traces);
  console.log("Your Score: " + eval.eval(yourPred));
  console.log("Base Score: " + eval.eval(baseline));
});


module.exports = {
  Evaluator: Evaluator
}
