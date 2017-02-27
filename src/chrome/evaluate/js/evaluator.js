// you may want to copy dist.js over from the prototype code!
var _ = require("underscore")
var fs = require("fs");


branches = ["bgwte", "fpyz", "gal", "gr2547_sh3266", "lw2666_az2407"]

var Evaluator = (function() {

  // @fullTraces a list of mouse traces: [ trace1, trace2, ...]
  //             where trace is [ [x, y, t, action], ... ]
  function Evaluator(fullTraces) {
    this.fullTraces = fullTraces;
    this.evaluators = _.object(_.map(branches, function(branch){
      var klass = require("./evaluator_"+branch).Evaluator;
      return [branch, new klass(fullTraces)];
    }));
  };

  // @predictor a Predictor object
  // @return an accuracy score between 0 and 1, where 0 sucks, and 1 is great
  Evaluator.prototype.eval = function(predictor) {
    var res = _.object(_.compact(_.map(this.evaluators, function(evaluator, branch) {
      try {
        return [branch, evaluator.eval(predictor)]
      } catch (e) {
        console.log(branch + "\t" + e.message)
        return null;
      }
    })));
    return res;
  };

  return Evaluator;
})();

module.exports = {
  Evaluator: Evaluator
}
