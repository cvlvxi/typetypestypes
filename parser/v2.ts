// deno-lint-ignore-file  no-unused-vars
/********************************************************************************
 * TypeParser Version 2
/********************************************************************************
 */

type InputType<T> = string | T;

type TypeParsed<ResultType> = {
  parsed: boolean;
  value?: ResultType;
  reason?: string;
};

type TypeCallback<T> = (input: InputType<T>) => TypeParsed<T>;

type TypeCallbacks<T> = {
  [K in keyof T]: TypeCallback<T[K]>;
};

type TypeCollection<T> = {
  [K in keyof T]: { input: InputType<T>; callback: TypeCallback<T> };
};

type TypeResults<T> = {
  [K in keyof T]: TypeParsed<T[K]>;
};

function collect<T>(
  inputs: T,
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

const GENERIC_TYPE_PARSE_ERROR = {
  parsed: false,
  reason: "Can't parse this type",
};

const NO_CALLBACK_FUNC_ERROR = {
  parsed: false,
  reason: "No associated callback parser function",
};

const ParseError = (reason: string) => {
  return { parsed: false, reason: reason };
};

class Parsers {
  static string<T>(input: InputType<T>): TypeParsed<string> {
    if (typeof input === "string") {
      if (input.includes("dog")) {
        return { parsed: false, reason: "Must not contain dog" };
      }
      return { parsed: true, value: input };
    }
    return GENERIC_TYPE_PARSE_ERROR;
  }

  static number<T>(input: InputType<T>): TypeParsed<number> {
    let n: undefined | number | string = undefined;
    if (typeof input === "string") {
      n = Number(input);
      if (Number.isNaN(n)) return ParseError("Can't parse this string");
    } else if (typeof input === "number") {
      n = input;
    } else {
      return GENERIC_TYPE_PARSE_ERROR;
    }
    if (n === 0) {
      return ParseError("Number can't be 0");
    }
    return { parsed: true, value: n };
  }

  // static parseObject<T>(callbacks: TypeCallbacks<T>): TypeCallback<T> {
  static object<T>(callbacks: TypeCallbacks<T>) {
    return function (inputs: T): TypeResults<T> {
      const collection = collect(inputs, callbacks);
      const arr = (Object.keys(collection) as Array<keyof T>).map(
        (key) => {
          const { input, callback }: {
            input: InputType<T>;
            callback: TypeCallback<T>;
          } = collection[key];
          if (!callback) {
            return [key, NO_CALLBACK_FUNC_ERROR];
          }
          return [key, callback(input)];
        },
      );
      const obj = Object.fromEntries(arr);
      return obj;
    };
  }
}


let parser = Parsers.object({
  dog: Parsers.number,
  cat: Parsers.string,
  obj: Parsers.object({
    sup: Parsers.number,
    chicken: Parsers.number,
  }),
  horse: Parsers.string,
  rat: Parsers.string,
});

const results = parser({
  dog: "dog",
  cat: "hello",
  obj: {
    sup: 1,
    chicken: "100",
    eel: "hello"
  },
  yo: "meh",
  rat: "dog",
});

console.log(results);


/**
 {
  dog: { parsed: false, reason: "Can't parse this string" },
  cat: { parsed: true, value: "hello" },
  obj: { sup: { parsed: true, value: 1 } },
  yo: { parsed: false, reason: "No associated callback parser function" },
  rat: { parsed: false, reason: "Must not contain dog" }
}
 */
