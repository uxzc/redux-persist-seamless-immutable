const { isImmutable } = require('./helpers');
const { createTransform } = require('redux-persist');
const Immutable = require('seamless-immutable');

const convertToPojo = state => state.asMutable({ deep: true });
// optionally convert this object into a JS object if it is Immutable
const fromImmutable = a => (isImmutable(a) ? convertToPojo(a) : a);
// convert this JS object into an Immutable object
const toImmutable = raw => Immutable(raw);
const objectWithoutKey = (object, key) => {
  const {[key]: deletedKey, ...otherKeys} = object;
  return otherKeys;
}

const seamlessImmutableTransformCreator = ({ whitelistPerReducer = {}, blacklistPerReducer = {} }) => {
  return createTransform(
    // transform state coming from redux on its way to being serialized and stored
    (state, key) => {
      const reducedStateKeys = Object.keys(state);
      if (whitelistPerReducer[key]) {
        reducedStateKeys.forEach(item => {
          if (!whitelistPerReducer[key].includes(item)) {
            state = objectWithoutKey(state, item);
          }
        });
      }
      if (blacklistPerReducer[key]) {
        reducedStateKeys.forEach(item => {
          if (blacklistPerReducer[key].includes(item)) {
            state = objectWithoutKey(state, item);
          }
        });
      }
      return fromImmutable(state);
    },
    // transform state coming from storage, on its way to be rehydrated into redux
    state => toImmutable(state)
  );
};

module.exports = {
  seamlessImmutableTransformCreator
};
