// deno-lint-ignore-file  no-unused-vars
/********************************************************************************
 * TypeParser Version 1:
 *  - Simple Parser pattern
/********************************************************************************
 */

type TypeParsed<T> = { parsed: true; value: T } | {
  parsed: false;
  reason: string;
};

// Assume input will always come in as string
type TypeInput<T> = Record<keyof T, string>;

type TypeCallback<T> = (input: string) => TypeParsed<T[keyof T]>;

// Inflight interface of all T's fields to something that returns TypeParse<T>
// TypeParse<T> will be defined by parsing functions
type TypeCallbacks<T> = {
  [K in keyof T]: TypeCallback<T>;
};

type TypeCollection<T> = {
  [K in keyof T]: { input: string; callback: TypeCallback<T> };
};

function collect<T>(
  inputs: TypeInput<T>,
  callbacks: TypeCallbacks<T>,
): TypeCollection<T> {
  type keyT = keyof T;
  const keyInputCallbackArray = (Object.keys(inputs) as Array<keyT>).map(
    (key) => {
      return [key, {
        input: inputs[key],
        callback: callbacks[key],
      }];
    },
  );
  return Object.fromEntries(
    keyInputCallbackArray,
  ) as unknown as TypeCollection<T>;
}

function parse<T>(collection: TypeCollection<T>) {
  type keyT = keyof T;
  type callbackResultT = TypeParsed<T[keyT]>;
  for (const key of (Object.keys(collection) as Array<keyT>)) {
    const { input, callback }: {
      input: string;
      callback: TypeCallback<T>;
    } = collection[key];
    const res: callbackResultT = callback(input);
    console.log(res);
  }
}

/********************************************************************************
 * Data Input
 * Requires:
 * - The Type: type / interface definition representing T
 * - The inputs: An object of TypeInput<T> which represents the inputs
 * - The callbacks: An object of TypeCallbacks<T> which represents the parsing
/********************************************************************************
 */
type Data = {
  dog: string;
  cat: number;
};

const dataInput: TypeInput<Data> = {
  dog: "hello",
  cat: "goodbye",
};

const dataFuncs: TypeCallbacks<Data> = {
  dog: (x) => {
    return { parsed: true, value: "ok" };
  },
  cat: (x) => {
    return { parsed: true, value: 1 };
  },
};

const collectData = collect<Data>(dataInput, dataFuncs);

// console.log(collectData)

parse(collectData);
