/**
 * Run-time type checking. Given a set of typed inputs, ensure the run-time configured
 * inputs are valid.
 */


var _ = require('lodash');
var types = require('./types');


var coerceValue = function(type, val, flags) {

  var coerceFlag = flags && flags.coerce || false;
  var baseTypeFlag = flags && flags.baseType || false;

  // Map types that are shorthand
  var to = type;
  if(type === 'string') to = 'str';
  if(type === 'boolean') to = 'bool';

  // WARNING: Will throw if the value can't be coerced
  if(!coerceFlag) return val;

  try {
    val = types[to].to(val);
  }
  catch (e) {
    // If we want the base type for this input catch it here
    if(!baseTypeFlag) throw e;
    val = types[to].base && types[to].base();
  }

  return val;
}

/**
 * Given a tuple value, check it for primatives
 */

var checkTuple = function(type, val) {

  // Check for string
  if(type === 'string') {
    return types.str.is(val);
  }

  // Check for number
  if(type === 'number') {
    return types.number.is(val);
  }

  // Check for boolean
  if(type === 'boolean') {
    return types.bool.is(val);
  }

  return false;
};

/**
 * Given a definition and a values object, ensure our types match up/
 */

var rttc = function(def, val, options) {

  options = options || {};

  // Should the value be coerced into the proper type?
  var coerce = options.coerce || false;

  // If the value can't be coerced should we use the base of the type for the value?
  // ex: NaN gets set as 0
  var baseType = options.base || false;

  // Hold our errors and return them all at once
  var errors = [];

  var parseObject = function(input, value) {
    _.each(_.keys(input), function(key) {
      var _input = input[key];
      var _value = value[key];

      // If the input is an object continue recursively parsing it
      if(types.obj.is(_input)) {
        parseObject(_input, _value);
        return;
      }

      _value = coerceValue(_input, _value, { coerce: coerce, baseType: baseType });
      var valid = checkTuple(_input, _value);
      if(!valid) {
        throw new Error('Invalid input value ', value);
      }

      value[key] = _value;
    });

    // Find the difference in the input and the value and remove any keys that
    // exist on the value but not on the input definition.
    var inputKeys = _.keys(input);
    var valueKeys = _.keys(value);
    var invalidKeys = _.difference(valueKeys, inputKeys);

    _.each(invalidKeys, function(key) {
      delete value[key];
    });

    return value;
  };

  // If we don't have an object then just check the tuple
  // If the input type isn't an object or array we can just do a simple type check
  if(!_.isObject(def)) {
    val = coerceValue(def, val, { coerce: coerce, baseType: baseType });
    var valid = checkTuple(def, val);
    if(!valid) {
      throw new Error('E_Invalid_Type');
    }

    return val;
  }

  // For each input, ensure the type is valid
  _.each(_.keys(def), function(inputName) {
    var input = def[inputName];
    var value = val[inputName];

    // Check if the input is required and missing
    if(input.required && types.undefined.is(value)) {
      errors.push('E_REQUIRED_INPUT');
      return;
    }

    // If type if not required and is undefined, return
    if(types.undefined.is(value)) {
      return;
    }

    // If the input is an array, parse it for each item
    if(_.isArray(input.type)) {
      if(value && !types.arr.is(value)) {
        errors.push('E_INVALID_TYPE');
        return;
      }

      _.each(value, function(item) {
        try {
          item = parseObject(input.type[0], item);
        }
        catch (err) {
          errors.push('E_INVALID_TYPE');
          return;
        }
      });

      val[inputName] = value;
      return;
    }

    // If the input is an object, recursively parse it
    if(types.obj.is(input.type)) {
      try {
        value = parseObject(input.type, value);
      }
      catch (err) {
        errors.push('Invalid type for input: ' + inputName);
        return;
      }

      val[inputName] = value;
      return;
    }

    // If the input type isn't an object or array we can just do a simple type check
    try {
      value = coerceValue(input.type, value, { coerce: coerce, baseType: baseType });
      var valid = checkTuple(input.type, value)
      if(!valid) {
        errors.push('Invalid type for input: ' + inputName);
        return;
      }
    }
    catch (e) {
      errors.push(e, inputName);
      return;
    }

    val[inputName] = value;
    return;
  });

  if(errors.length) {
    throw new Error(errors);
  }

  return val;
};

module.exports = rttc;