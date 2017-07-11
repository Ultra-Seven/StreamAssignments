var DataStructure = require("./datastruct").DataStructure;
var GarbageCollectingDataStructure = require("./datastruct").GarbageCollectingDataStructure;
var Decoders = require("./decoders");
var RangeIndex = require("./rangeidx");
var Util = require("./util");
var GBQueryTemplate = require("./query").GBQueryTemplate;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;


// Client version of ds.py:ProgressiveDataStructure
//
// You probably don't want to use exactly the same implementation as the ProgressiveDataStructure because
// you may need to track multiple blocks for the same result
var ProgressiveDataStructure = (function(GarbageCollectingDataStructure) {
  extend(ProgressiveDataStructure, GarbageCollectingDataStructure);

  // this should match the encoding in ds.py:ProgressiveDataStructure
  var encoding = 2;
  this.encoding = encoding;

  function ProgressiveDataStructure() {
    GarbageCollectingDataStructure.call(this);

    this.idx = {};
    this.encoding = encoding;
    this.decoder = new Decoders.TableDecoder();
  };

  // TODO: you probably want to override this with something custom to deal with progressive blocks!
  // ProgressiveDataStructure.prototype.readHeader = function(block) {
  //   return Progressive.prototype.readHeader.call(this, block);
  // }

  // TODO: override with your implementation
  // @param bytes: a UInt8Array of a block of data
  //
  // If you used a custom encoding using StringIO/struct, then be careful about the size of the UInt/Float array
  // that you cast the bytes to.  If you cast an 8bit array to a 16bit array, javascript will _pad_
  // each element to be 16bits and potentially mess up your calculations.
  //
  ProgressiveDataStructure.prototype.decode = function(bytes) {
    //throw Error("Not Implemented");
    const quantization = [16, 11, 10, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
    var deBytes = this.decoder.decode(bytes)
    //console.log("first decode:", deBytes);
    var tempBytes = [];
    for (var i = 0; i < deBytes.length; i++) {
      tempBytes.push(deBytes[i].y);
      //console.log(deBytes[i].x, deBytes[i].y);
    }
    for(let index in tempBytes) {
        tempBytes[index] = Math.floor(tempBytes[index] * quantization[index]);
    }
    const N = tempBytes.length;
    var decoded_list = [];
    for(let index = 0; index < N; index++) {
        let c = 0;
        for(let n = 1; n < N; n++) {
            c = c + tempBytes[n] * Math.cos((Math.PI / N) * n * (index + 0.5) )
        }
        c = c + 0.5 * tempBytes[0];
        c = Math.floor(c * 2.0 / N);
        decoded_list.push(Math.floor(c));
    }
    for (var i = 0; i < deBytes.length; i++) {
      deBytes[i].y = decoded_list[i];
    }
    //console.log("decoder:", decoder);
    return deBytes;
  
  };

  // TODO: store the data (and header?) in your data structure
  ProgressiveDataStructure.prototype.storeData = function(data, header) {
    //throw Error("Not Implemented");
    this.idx[data.key] = data;
  };
  
  // TODO: this should remove the data from your data structure because it has been removed from the ring buffer
  ProgressiveDataStructure.prototype.removeData = function(data) {
    if (data && data.key) {
      //throw Error("Not Implemented");
      delete this.idx[data.key];
    }
  };

  // This data struture can answer progressive and gbquery templates.
  ProgressiveDataStructure.prototype.canAnswer = function(q) {
    return q.template.name == "progressive" || q.template.name == "gbquery";
  };

  ProgressiveDataStructure.prototype.tryExec = function(q, cb) {
    //throw Error("Not Implemented");
    if (!this.canAnswer(q)) 
      return null;
    var key = this.queryToKey(q);
    if (key in this.idx) {
      if (cb) cb(this.idx[key].table);
      return this.idx[key].table;
    }

    return null;
  };


  return ProgressiveDataStructure;
})(GarbageCollectingDataStructure);

module.exports = {
  ProgressiveDataStructure: ProgressiveDataStructure
}



