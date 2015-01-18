/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var testExitCoercion = require('./helpers/test-exit-coercion.helper');
var Writable = require('stream').Writable;


describe('exit output coercion', function (){

  var EXIT_TEST_SUITE = [

    ////////////////////////////////////////////
    // STRINGS
    ////////////////////////////////////////////

    { example: 'foo', actual: 'bar', result: 'bar' },
    { example: 'foo', actual: '', result: '' },

    { example: 'foo', actual: 0, result: '0' },
    { example: 'foo', actual: 1, result: '1' },
    { example: 'foo', actual: -1.1, result: '-1.1' },

    { example: 'foo', actual: true, result: 'true' },
    { example: 'foo', actual: false, result: 'false' },

    { example: 'foo', actual: {}, result: '' },
    { example: 'foo', actual: {foo:'bar'}, result: '' },
    { example: 'foo', actual: {foo:{bar:{baz:{}}}}, result: '' },
    { example: 'foo', actual: {foo:['bar']}, result: '' },
    { example: 'foo', actual: {foo:{bar:{baz:[{}]}}}, result: '' },

    { example: 'foo', actual: [], result: '' },
    { example: 'foo', actual: ['asdf'], result: '' },
    { example: 'foo', actual: [''], result: '' },
    { example: 'foo', actual: [235], result: '' },
    { example: 'foo', actual: [false], result: '' },
    { example: 'foo', actual: [{}], result: '' },
    { example: 'foo', actual: [{foo:'bar'}], result: '' },

    { example: 'foo', actual: undefined, result: '' },
    { example: 'foo', actual: NaN, result: '' },
    { example: 'foo', actual: Infinity, result: '' },
    { example: 'foo', actual: -Infinity, result: '' },
    { example: 'foo', actual: null, result: '' },

    { example: 'foo', actual: /some regexp/, result: '' },
    { example: 'foo', actual: function(){}, result: '' },
    { example: 'foo', actual: new Date('November 5, 1605'), result: '' }, // TODO: '1605-11-05T07:00:00.000Z'
    { example: 'foo', actual: new Writable(), result: '' }, // TODO: consider buffering into a string..?  needs community discussion
    { example: 'foo', actual: new Buffer('asdf'), result: '' }, // TODO: consider converting to string
    { example: 'foo', actual: new Error('asdf'), result: '' }, // TODO: show `.toString()`

    ////////////////////////////////////////////
    // NUMBERS
    ////////////////////////////////////////////

    { example: 123, actual: 'bar', result: 0 },
    { example: 123, actual: '', result: 0 },
    { example: 123, actual: '0', result: 0 },
    { example: 123, actual: '1', result: 1 },
    { example: 123, actual: '-1.1', result: -1.1 },
    { example: 123, actual: 'NaN', result: 0 },
    { example: 123, actual: 'undefined', result: 0 },
    { example: 123, actual: 'null', result: 0 },
    { example: 123, actual: '-Infinity', result: 0 },
    { example: 123, actual: 'Infinity', result: 0 },

    { example: 123, actual: 0, result: 0 },
    { example: 123, actual: 1, result: 1 },
    { example: 123, actual: -1.1, result: -1.1 },

    { example: 123, actual: true, result: 1 },
    { example: 123, actual: false, result: 0 },

    { example: 123, actual: {}, result: 0 },
    { example: 123, actual: {foo:'bar'}, result: 0 },
    { example: 123, actual: {foo:{bar:{baz:{}}}}, result: 0 },
    { example: 123, actual: {foo:['bar']}, result: 0 },
    { example: 123, actual: {foo:{bar:{baz:[{}]}}}, result: 0 },

    { example: 123, actual: [], result: 0 },
    { example: 123, actual: ['asdf'], result: 0 },
    { example: 123, actual: [''], result: 0 },
    { example: 123, actual: [235], result: 0 },
    { example: 123, actual: [false], result: 0 },
    { example: 123, actual: [{}], result: 0 },
    { example: 123, actual: [{foo:'bar'}], result: 0 },

    { example: 123, actual: undefined, result: 0 },
    { example: 123, actual: NaN, result: 0 },
    { example: 123, actual: Infinity, result: 0 },
    { example: 123, actual: -Infinity, result: 0 },
    { example: 123, actual: null, result: 0 },

    { example: 123, actual: /some regexp/, result: 0 },
    { example: 123, actual: function(){}, result: 0 },
    { example: 123, actual: new Date('November 5, 1605'), result: 0 }, // TODO: consider enhancing this to return an epoch timestamp (number of miliseconds since Jan 1, 1970). In this case, would be: -11491606800000
    { example: 123, actual: new Writable(), result: 0 }, // TODO: ??? maybe num bytes read so far?
    { example: 123, actual: new Buffer('asdf'), result: 0 },  // TODO: ??? maybe size of the buffer in bytes?
    { example: 123, actual: new Error('asdf'), result: 0 }, // TODO: ??? maybe `.status`?

    ////////////////////////////////////////////
    // BOOLEANS
    ////////////////////////////////////////////
    { example: true, actual: 'bar', result: false },
    { example: true, actual: '', result: false },
    { example: true, actual: '-1.1', result: false },
    { example: true, actual: 'NaN', result: false },
    { example: true, actual: 'undefined', result: false },
    { example: true, actual: 'null', result: false },
    { example: true, actual: '-Infinity', result: false },
    { example: true, actual: 'Infinity', result: false },
    { example: true, actual: 'true', result: true },
    { example: true, actual: 'false', result: false },
    { example: true, actual: '0', result: false },
    { example: true, actual: '1', result: true },

    { example: true, actual: 0, result: false },
    { example: true, actual: 1, result: true },
    { example: true, actual: -1.1, result: false },

    { example: true, actual: true, result: true },
    { example: true, actual: false, result: false },

    { example: true, actual: {}, result: false },
    { example: true, actual: {foo:'bar'}, result: false },
    { example: true, actual: {foo:{bar:{baz:{}}}}, result: false },
    { example: true, actual: {foo:['bar']}, result: false },
    { example: true, actual: {foo:{bar:{baz:[{}]}}}, result: false },

    { example: true, actual: [], result: false },
    { example: true, actual: ['asdf'], result: false },
    { example: true, actual: [''], result: false },
    { example: true, actual: [235], result: false },
    { example: true, actual: [false], result: false },
    { example: true, actual: [{}], result: false },
    { example: true, actual: [{foo:'bar'}], result: false },

    { example: true, actual: undefined, result: false },
    { example: true, actual: NaN, result: false },
    { example: true, actual: Infinity, result: false },
    { example: true, actual: -Infinity, result: false },
    { example: true, actual: null, result: false },

    { example: true, actual: /some regexp/, result: false },
    { example: true, actual: function(){}, result: false },
    { example: true, actual: new Date('November 5, 1605'), result: false },
    { example: true, actual: new Writable(), result: false },
    { example: true, actual: new Buffer('asdf'), result: false },
    { example: true, actual: new Error('asdf'), result: false },

    ////////////////////////////////////////////
    // DICTIONARIES
    ////////////////////////////////////////////

    { example: {}, actual: 'bar', result: {} },
    { example: {}, actual: 123, result: {} },
    { example: {}, actual: true, result: {} },

    { example: {}, actual: {}, result: {} },
    { example: {}, actual: {foo:'bar'}, result: {foo:'bar'} },
    { example: {}, actual: {foo:{bar:{baz:{}}}}, result: {foo:{bar:{baz:{}}}} },
    { example: {}, actual: {foo:['bar']}, result: {foo:['bar']} },
    { example: {}, actual: {foo:{bar:{baz:[{}]}}}, result: {foo:{bar:{baz:[{}]}}} },

    { example: {}, actual: [], result: {} },
    { example: {}, actual: ['asdf'], result: {} },
    { example: {}, actual: [''], result: {} },
    { example: {}, actual: [235], result: {} },
    { example: {}, actual: [false], result: {} },
    { example: {}, actual: [{}], result: {} },
    { example: {}, actual: [{foo:'bar'}], result: {} },

    { example: {}, actual: undefined, result: {} },
    { example: {}, actual: NaN, result: {} },
    { example: {}, actual: Infinity, result: {} },
    { example: {}, actual: -Infinity, result: {} },
    { example: {}, actual: null, result: {} },

    { example: {}, actual: /some regexp/, result: {} },
    { example: {}, actual: function(){}, result: {} },
    { example: {}, actual: new Date('November 5, 1605'), result: {} },
    { example: {}, actual: new Writable(), result: {} },
    { example: {}, actual: new Buffer('asdf'), result: {} },
    { example: {}, actual: new Error('asdf'), result: {} },  // TODO: consider enhancing this behavior to guarantee e.g. `.message` (string), `.stack` (string), `.code` (string), and `.status` (number).  Needs community discussion


    ////////////////////////////////////////////
    // ARRAYS
    ////////////////////////////////////////////

    { example: [], actual: 'bar', result: [] },
    { example: [], actual: 123, result: [] },
    { example: [], actual: true, result: [] },

    { example: [], actual: {}, result: [] },
    { example: [], actual: {foo:'bar'}, result: [] },
    { example: [], actual: {foo:{bar:{baz:{}}}}, result: [] },
    { example: [], actual: {foo:['bar']}, result: [] },
    { example: [], actual: {foo:{bar:{baz:[{}]}}}, result: [] },

    { example: [], actual: [], result: [] },
    { example: [], actual: ['asdf'], result: ['asdf'] },
    { example: [], actual: [''], result: [''] },
    { example: [], actual: [235], result: [235] },
    { example: [], actual: [false], result: [false] },
    { example: [], actual: [{}], result: [{}] },
    { example: [], actual: [{foo:'bar'}], result: [{foo: 'bar'}] },

    { example: [], actual: undefined, result: [] },
    { example: [], actual: NaN, result: [] },
    { example: [], actual: Infinity, result: [] },
    { example: [], actual: -Infinity, result: [] },
    { example: [], actual: null, result: [] },

    { example: [], actual: /some regexp/, result: [] },
    { example: [], actual: function(){}, result: [] },
    { example: [], actual: new Date('November 5, 1605'), result: [] },
    { example: [], actual: new Writable(), result: [] }, // TODO: consider enhancing this behavior to concat the stream contents? Needs community discussion.
    { example: [], actual: new Buffer('asdf'), result: [] },
    { example: [], actual: new Error('asdf'), result: [] },


  ];

  _.each(EXIT_TEST_SUITE, function (test){

    describe((function _determineDescribeMsg(){
      var msg = '';
      if (test.void){
        msg += 'void exit ';
      }
      else {
        msg += 'exit ';
      }

      if (!_.isUndefined(test.example)) {
        msg += 'with a '+typeof test.example+' example ('+util.inspect(test.example,false, null)+')';
      }
      else {
        msg +='with no example';
      }

      return msg;
    })(), function suite (){
      if (test.error) {
        it('should error', function (done){
          testInputValidation(test, done);
        });
        return;
      }
      else {
        it(util.format('should coerce %s', (_.isObject(test.actual)&&test.actual.constructor && test.actual.constructor.name !== 'Object')?test.actual.constructor.name:util.inspect(test.actual, false, null), 'into '+util.inspect(test.result, false, null)+''), function (done){
          testExitCoercion(test, done);
        });
      }
    });
  });

});